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
├── topology.json              # トピック名・配信回数など（Terraform と共通）
├── topology.ts                # エミュレーター向けのトピック・サブスクリプション作成（既にあれば何もしない）
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
terraform/                     # 本物の GCP のリソースと IAM（tests/ に terraform test）
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

アプリのコードはそのままで動きます。`PUBSUB_EMULATOR_HOST` を外すと、クライアントライブラリが Application Default Credentials（ADC）で本物の Pub/Sub に接続します。
トピック・サブスクリプション・IAM は [`terraform/`](terraform) で管理します。

| 環境 | リソースの作り方 |
|---|---|
| エミュレーター | `pnpm setup:topology`（`src/topology.ts`）。Terraform はエミュレーターに接続できないため |
| 本物の GCP | `terraform apply`（`terraform/`）。Dead Letter や Push の IAM までまとめて管理できるため |

トピック名や Dead Letter までの配信回数は [`src/topology.json`](src/topology.json) にあり、TypeScript と Terraform の両方がこのファイルを読みます。

### 1. プロジェクトと認証

```bash
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID
gcloud auth application-default login   # 手元の ADC（Terraform とアプリの両方が使う）
```

- 課金アカウントの紐付けが必要です。Pub/Sub は毎月 10 GiB まで無料枠があり、この検証の規模なら費用はほぼかかりません。
- API の有効化（`pubsub.googleapis.com` など）も Terraform が行います。

| 実行する場所 | 認証方法 |
|---|---|
| 手元 | `gcloud auth application-default login`（自分のアカウントで ADC を作る） |
| Cloud Run | サービスに割り当てたサービスアカウント（キーファイル不要） |
| GitHub Actions | Workload Identity 連携 + `google-github-actions/auth`（キーファイル不要） |

### 2. Terraform で作る

```bash
cd packages/pubsub/terraform
cp terraform.tfvars.example terraform.tfvars   # project_id などを埋める
terraform init
terraform plan
terraform apply
```

作られるもの:

| リソース | 内容 |
|---|---|
| API | `pubsub.googleapis.com`、`iam.googleapis.com` |
| トピック | `user-events`、`user-events-dead-letter` |
| サブスクリプション | `welcome-mail`（Pull）、`search-index`（Push。`push_endpoint` を指定したときだけ）、`user-events-dead-letter-inspect`。いずれも無期限（既定の「31日間使われないと削除」を無効化） |
| Dead Letter の権限 | Pub/Sub のサービスエージェントに、Dead Letter トピックの publisher と各サブスクリプションの subscriber |
| Push 用サービスアカウント | `pubsub-push`（Push に OIDC トークンを付ける） |
| アプリの権限（任意） | `publisher_members` / `welcome_mail_subscriber_members` に、トピック・サブスクリプション単位で付与 |

`terraform apply` を実行するアカウントに必要な権限の目安です（検証用プロジェクトならオーナーでも構いません）。

| 用途 | ロール |
|---|---|
| API の有効化 | `roles/serviceusage.serviceUsageAdmin` |
| トピック・サブスクリプションと、その IAM | `roles/pubsub.admin`（`pubsub.editor` では IAM を設定できない） |
| サービスアカウントの作成と、その IAM | `roles/iam.serviceAccountAdmin` |
| OIDC 付きの Push 型サブスクリプションを作る | Push 用サービスアカウントに対する `roles/iam.serviceAccountUser`（`actAs`） |

state は手元（`terraform.tfstate`）に置きます。複数人や CI から apply するようになったら、`versions.tf` のコメントにある GCS バックエンドに移してください。

### 3. Pull 型を試す

```bash
cd packages/pubsub
export PUBSUB_PROJECT_ID=$PROJECT_ID
unset PUBSUB_EMULATOR_HOST
pnpm start:pull                          # 手元から本物のサブスクリプションを Pull する
pnpm register alice@example.com Alice
```

### 4. Push 型を試す

Push 型の配信先は、インターネットから届く **HTTPS** のエンドポイントである必要があります（`localhost` には届きません）。
`push-app.ts` は Cloud Run にそのままデプロイできる形です（`PORT` 環境変数で待ち受けます）。デプロイ用の Dockerfile と Cloud Run の Terraform はまだ用意していません。

Pub/Sub 以外からの呼び出しを防ぐため、Cloud Run 側で認証を必須にし、Push に OIDC トークンを付けさせます。

```bash
# 1. Cloud Run を認証必須（--no-allow-unauthenticated）でデプロイし、Push 用サービスアカウントに呼び出し権限を付ける
gcloud run services add-iam-policy-binding <SERVICE> --region=<REGION> \
  --member=serviceAccount:$(terraform -chdir=terraform output -raw push_service_account_email) \
  --role=roles/run.invoker

# 2. terraform.tfvars に push_endpoint を足して、Push 型サブスクリプションを作る
#    push_endpoint = "https://<SERVICE_URL>/pubsub/push"
terraform -chdir=terraform apply
```

- トークンの検証は Cloud Run が行うので、アプリのコードでの検証は不要です。
- Cloud Run はトークンの audience をサービス URL（パスなし）と照合します。Terraform は既定で `push_endpoint` のオリジン（`https://<SERVICE_URL>`）を audience にします。カスタム audience を使う場合は `push_audience` で指定します。
- 2021年4月8日より前に作られたプロジェクトでは、`grant_token_creator_to_pubsub_agent = true` にします（Pub/Sub のサービスエージェントが OIDC トークンを発行するために必要）。

### 5. 片付け

```bash
terraform -chdir=terraform destroy
```

### Terraform のテスト

GCP に接続せずに確認できるチェックを CI で実行しています（`.github/workflows/ci.yml` の `terraform` ジョブ）。

```bash
cd packages/pubsub/terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
terraform test   # mock_provider で plan の内容を確かめる（tests/）
```

## 設計メモ（本番に向けて）

- **発行の取りこぼし**: `registerUserAndPublish` は、保存と発行が1つのトランザクションになりません。保存後・発行前に落ちるとイベントが失われるため、本番では Outbox パターン（DB に保存したイベントを別プロセスが発行する）などで補います。
- **重複排除の記録**: `InMemoryProcessedEventStore` はプロセス内だけの記録です。本番では DB の条件付き更新や Firestore のトランザクションを使い、複数インスタンス間でも原子的に判定します。
  - 処理前に永久の予約を置くと、処理中に落ちたときに再配信が「処理済み」と見なされてメールが失われます。そのため期限付きのリースにし、処理が終わってから処理済みにしています。
  - 送信後・処理済みにする前に落ちると再送になります。これは記録だけでは防げないので、メール送信 API の冪等キー（`eventId`）で1通にまとめます。
- **不正なメッセージ**: 今は ack して捨てています。調査のために残したい場合は、Dead Letter トピックに自分で発行してから ack する方法があります。
- **順序**: 同じユーザーのイベントの順序を保証したい場合は、ordering key（例: ユーザー ID）を使います（このサンプルでは未使用）。
