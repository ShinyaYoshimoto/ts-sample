# pubsub

Google Cloud Pub/Sub と TypeScript でイベント駆動の処理を作るための技術検証です。
ユーザー登録（[`../shared/user-domain`](../shared/user-domain)）で発行した `UserRegistered` イベントを、Pull 型と Push 型の2つのサブスクリプションで受け取ります。

```
registerUser ──publish──▶ [topic: user-events]
                              ├─▶ welcome-mail（Pull 型）  ウェルカムメールを送る（eventId で重複排除）
                              └─▶ search-index（Push 型）  検索インデックスを更新する（upsert で冪等）
                                          │
                                          └─ 5回失敗したら ▶ [topic: user-events-dead-letter]
```

GCP のプロジェクトがなくても、Pub/Sub エミュレーターで全部動かせます。本物の GCP で動かす手順は[後半](#本物の-gcp-で動かす)にあります。

## 検証していること

| 観点 | このサンプルでの扱い | テスト |
|---|---|---|
| 型安全なメッセージ | zod スキーマ（`events.ts`）で、発行時に作り・受信時に検証する | 単体 |
| 少なくとも1回の配信 | 副作用のある処理（メール）は `eventId` のリースと処理済みの記録で重複排除し、送信 API にも `eventId` を冪等キーとして渡す。上書きで済む処理（インデックス）は処理自体を冪等にする | 単体 / エミュレーター |
| 一時的な失敗 | Pull 型は nack、Push 型は 500 を返して再配信させる | エミュレーター |
| Dead Letter | 5回失敗したら `user-events-dead-letter` に移る（配信回数などが属性に付く） | エミュレーター |
| 不正なメッセージ | 何度再配信しても直らないので ack して捨て、ログに残す | 単体 / エミュレーター |
| Pull 型と Push 型 | Pull はクライアントライブラリのストリーミング、Push は Hono の HTTP エンドポイント（Cloud Run 向け） | エミュレーター |

## 構成

```
src/
├── events.ts                  # イベントのスキーマ（zod）と、作成・検証
├── config.ts                  # 環境変数とトピック・サブスクリプション名
├── topology.ts                # トピック・サブスクリプション・Dead Letter の作成（既にあれば何もしない）
├── publisher.ts               # ユーザー登録 → イベント発行
├── consumers/
│   ├── process-message.ts     # ack / nack の判断（Pull 型・Push 型で共通）
│   ├── welcome-mail.ts        # ウェルカムメール（eventId で重複排除）
│   └── search-index.ts        # 検索インデックス（upsert で冪等）
├── pull-subscriber.ts         # Pull 型の購読
├── push-app.ts                # Push 型の受信エンドポイント（Hono）
├── cli/                       # 手元で動かすためのコマンド
├── consumers.test.ts          # 単体テスト（エミュレーター不要）
└── emulator.test.ts           # 結合テスト（エミュレーターが必要）
```

## 手元で動かす（エミュレーター）

```bash
# リポジトリのルートでエミュレーターを起動
docker compose up -d pubsub-emulator

cd packages/pubsub
export PUBSUB_EMULATOR_HOST=localhost:8085
export METADATA_SERVER_DETECTION=none   # GCE のメタデータサーバーを探しに行かない（警告を抑える）

# トピックとサブスクリプションを作る（Push 型の配信先は、コンテナから見たホスト上のサーバー）
PUSH_ENDPOINT=http://host.docker.internal:8080/pubsub/push pnpm setup:topology

pnpm start:push                          # 別のターミナルで: Push 型の受信サーバー（:8080）
pnpm start:pull                          # 別のターミナルで: Pull 型のワーカー
pnpm register alice@example.com Alice    # ユーザーを登録してイベントを発行
```

テスト:

```bash
pnpm test   # 単体テスト。PUBSUB_EMULATOR_HOST があれば結合テストも実行する
# エミュレーターを docker compose で動かしている場合は、Push 型のテストの配信先をホストに向ける
PUBSUB_PUSH_HOST=host.docker.internal pnpm test
```

CI（`.github/workflows/ci.yml`）では、エミュレーターをホストネットワークで起動して結合テストまで実行しています。

### エミュレーターでわかったこと

- Pull 型・Push 型・Dead Letter（配信回数と属性を含む）は再現できる
- Push 型の配信には `deliveryAttempt` が付かない（本物の Pub/Sub では Dead Letter ポリシーがあると付く）
- exactly-once 配信、IAM、Push 認証（OIDC トークン）など、エミュレーターでは確かめられない機能がある

## 本物の GCP で動かす

コードはそのままで動きます。`PUBSUB_EMULATOR_HOST` を外すと、クライアントライブラリが Application Default Credentials（ADC）で本物の Pub/Sub に接続します。

### 1. プロジェクトと API

```bash
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID
gcloud services enable pubsub.googleapis.com run.googleapis.com   # run は Push 型を Cloud Run で受ける場合
```

- 課金アカウントの紐付けが必要です。Pub/Sub は毎月 10 GiB まで無料枠があり、この検証の規模なら費用はほぼかかりません。
- 検証が終わったら、トピック・サブスクリプション・Cloud Run サービスを削除してください。

### 2. 認証

| 実行する場所 | 認証方法 |
|---|---|
| 手元 | `gcloud auth application-default login`（自分のアカウントで ADC を作る） |
| Cloud Run | サービスに割り当てたサービスアカウント（キーファイル不要） |
| GitHub Actions | Workload Identity 連携 + `google-github-actions/auth`（キーファイル不要） |

必要なロールの目安:

| 用途 | ロール |
|---|---|
| トピック・サブスクリプションを作る（`setup:topology`） | `roles/pubsub.editor` |
| イベントを発行する | `roles/pubsub.publisher`（トピック単位で付与できる） |
| Pull 型で受け取る | `roles/pubsub.subscriber`（サブスクリプション単位で付与できる） |
| OIDC 付きの Push 型サブスクリプションを作る | 上記に加えて、Push 用サービスアカウントに対する `roles/iam.serviceAccountUser` |

### 3. トピックとサブスクリプション

```bash
cd packages/pubsub
export PUBSUB_PROJECT_ID=$PROJECT_ID
unset PUBSUB_EMULATOR_HOST
pnpm setup:topology   # Pull 型と Dead Letter まで作る（Push 型は手順 5 で）
```

Dead Letter を使うには、Pub/Sub のサービスエージェントに権限を付ける必要があります（エミュレーターでは不要）。

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
PUBSUB_SA=serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com

gcloud pubsub topics add-iam-policy-binding user-events-dead-letter --member=$PUBSUB_SA --role=roles/pubsub.publisher
gcloud pubsub subscriptions add-iam-policy-binding welcome-mail --member=$PUBSUB_SA --role=roles/pubsub.subscriber
gcloud pubsub subscriptions add-iam-policy-binding search-index --member=$PUBSUB_SA --role=roles/pubsub.subscriber  # 手順 5 の後
```

### 4. Pull 型を試す

```bash
pnpm start:pull                          # 手元から本物のサブスクリプションを Pull する
pnpm register alice@example.com Alice
```

### 5. Push 型を試す

Push 型の配信先は、インターネットから届く **HTTPS** のエンドポイントである必要があります（`localhost` には届きません）。
`push-app.ts` は Cloud Run にそのままデプロイできる形です（`PORT` 環境変数で待ち受けます）。デプロイ用の Dockerfile はまだ用意していません。

Pub/Sub 以外からの呼び出しを防ぐため、Cloud Run 側で認証を必須にし、Push に OIDC トークンを付けさせます。

```bash
# Push 用のサービスアカウントに Cloud Run の呼び出し権限を付ける
gcloud iam service-accounts create pubsub-push
gcloud run services add-iam-policy-binding <SERVICE> --region=<REGION> \
  --member=serviceAccount:pubsub-push@${PROJECT_ID}.iam.gserviceaccount.com --role=roles/run.invoker

# setup:topology を実行する人（またはサービスアカウント）が、Push 用サービスアカウントとして
# トークンを発行させられるようにする（iam.serviceAccounts.actAs。roles/pubsub.editor には含まれない）
gcloud iam service-accounts add-iam-policy-binding pubsub-push@${PROJECT_ID}.iam.gserviceaccount.com \
  --member=user:<YOUR_EMAIL> --role=roles/iam.serviceAccountUser

# Push 型サブスクリプションを作る（OIDC トークン付き）
PUSH_ENDPOINT=https://<SERVICE_URL>/pubsub/push \
PUSH_AUTH_SERVICE_ACCOUNT=pubsub-push@${PROJECT_ID}.iam.gserviceaccount.com \
pnpm setup:topology
```

- Cloud Run は `--no-allow-unauthenticated` でデプロイします。トークンの検証は Cloud Run が行うので、アプリのコードでの検証は不要です。
- 2021年4月8日より前に作られたプロジェクトでは、Pub/Sub のサービスエージェントに、Push 用サービスアカウントの `roles/iam.serviceAccountTokenCreator` を付ける必要があります。

## 設計メモ（本番に向けて）

- **発行の取りこぼし**: `registerUserAndPublish` は、保存と発行が1つのトランザクションになりません。保存後・発行前に落ちるとイベントが失われるため、本番では Outbox パターン（DB に保存したイベントを別プロセスが発行する）などで補います。
- **重複排除の記録**: `InMemoryProcessedEventStore` はプロセス内だけの記録です。本番では DB の条件付き更新や Firestore のトランザクションを使い、複数インスタンス間でも原子的に判定します。
  - 処理前に永久の予約を置くと、処理中に落ちたときに再配信が「処理済み」と見なされてメールが失われます。そのため期限付きのリースにし、処理が終わってから処理済みにしています。
  - 送信後・処理済みにする前に落ちると再送になります。これは記録だけでは防げないので、メール送信 API の冪等キー（`eventId`）で1通にまとめます。
- **不正なメッセージ**: 今は ack して捨てています。調査のために残したい場合は、Dead Letter トピックに自分で発行してから ack する方法があります。
- **順序**: 同じユーザーのイベントの順序を保証したい場合は、ordering key（例: ユーザー ID）を使います（このサンプルでは未使用）。
