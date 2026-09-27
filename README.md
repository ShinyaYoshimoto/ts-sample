# 概要

- Typescriptを用いたサンプルコード集
- 良し悪しはともかくやってみたいことやってみる

## モノレポ構成

このリポジトリはpnpm workspaceを使用したモノレポ構成になっています。

### ディレクトリ構成

```
packages/
├── <サンプル名>/   # 1テーマ = 1パッケージ（詳細は各パッケージの README.md）
└── shared/         # 複数のサンプルから使う共通ライブラリ
```

- パッケージ名は `@ts-sample/<ディレクトリ名>`（例: `packages/result-type` → `@ts-sample/result-type`）
- 同じ目的で比較したい実装は、1つのパッケージにまとめてサブディレクトリで分けます（例: `result-type/src/neverthrow`）
- 各パッケージの目的や使い方は、そのパッケージの `README.md` に書きます

### コマンド

```bash
# 全パッケージの依存関係をインストール
pnpm install

# 全パッケージをビルド
pnpm build

# 全パッケージのテストを実行
pnpm test

# 全パッケージのlintを実行
pnpm lint

# Elasticsearchとデータベースを起動
docker-compose up -d
```

### CI の手動実行

GitHub の Actions タブ →「CI」→「Run workflow」から手動でビルド・テストを実行できます。

- `packages` に `packages/` からのパスを指定すると、そのパッケージだけをテストします（スペースまたはカンマ区切りで複数指定可。例: `result-type api-styles shared/elasticsearch-client`）
- 指定したパッケージが依存するワークスペースパッケージはビルド対象に自動で含まれます
- 空欄の場合は全パッケージを対象にします

### Elasticsearch サンプルの実行

```bash
# Elasticsearchを起動
docker-compose up -d elasticsearch kibana

# サンプルアプリケーションを実行
cd packages/elasticsearch-app
pnpm start
```

Kibanaは http://localhost:5601 でアクセスできます。

## やりたいこと（順次更新）

- AI活用
  - [ ] Calude Codeの活用
- 開発
  - [ ] ヘキサゴナルアーキテクチャ
  - [ ] 関数型プログラミング
  - [x] Result型の実装（[packages/result-type](packages/result-type)）
    - [x] tRPCによるResult型の伝搬
    - [x] GraphQL Union型を用いたResult Pattern
    - [x] Connect (gRPC) を用いたContract-firstなResult Pattern
  - [ ] CQRS
  - [ ] イベントソーシング
  - [ ] 分散トランザクション
- モデリング
  - [ ] sudoモデリング
  - [ ] イミュータブルデータモデル
- ツール・ライブラリ
  - [ ] zod
  - [ ] postgres
  - [ ] redis
  - [ ] firestore
  - [x] elasticsearch
  - [ ] Prisma
  - [ ] effect-ts
  - [x] lint, formatter
    - [x] biome
    - [x] prettier
  - [ ] tsgo
  - [ ] hash化アルゴリズム
    - [ ] bcrypt
    - [ ] Argon2


## biome

- [リファレンス](https://biomejs.dev/ja/reference/configuration/#javascriptformatterquotestyle)