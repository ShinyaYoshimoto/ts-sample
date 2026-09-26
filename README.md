# 概要

- Typescriptを用いたサンプルコード集
- 良し悪しはともかくやってみたいことやってみる

## モノレポ構成

このリポジトリはpnpm workspaceを使用したモノレポ構成になっています。

### Packages

- **@ts-sample/sample-gemini** - Gemini APIを使ったサンプル（React + Vite）
- **@ts-sample/sample-generator** - Generatorを使ったメモリ効率の良いストリーム処理のサンプル
- **@ts-sample/sample-hexagonal-architecture** - ヘキサゴナルアーキテクチャのサンプル実装
- **@ts-sample/sample-immutable-data-model** - イミュータブルデータモデルのサンプル
- **@ts-sample/sample-zod** - Zodを使ったバリデーションのサンプル
- **@ts-sample/elasticsearch-client** - Elasticsearch共有クライアントパッケージ
- **@ts-sample/sample-elasticsearch-app** - Elasticsearchを使った商品検索のサンプル
- **@ts-sample/prisma** - Prismaスキーマとマイグレーション

#### Result型 / エラーハンドリング

- **@ts-sample/sample-un-result** - Result型ライブラリを使わない素のTypeScriptによるベースライン実装
- **@ts-sample/sample-neverthrow** - neverthrowを使ったResult型のサンプル
- **@ts-sample/sample-byethrow** - @praha/byethrowを使ったResult型のサンプル
- **@ts-sample/sample-fp-ts** - fp-tsを使ったエラーハンドリングのサンプル
- **@ts-sample/sample-effect-ts** - Effectを使ったエラーハンドリングのサンプル
- **@ts-sample/sample-trpc** - tRPCでResult型（Discriminated Union）をクライアントへ伝搬するサンプル
- **@ts-sample/sample-graphql-union** - GraphQL Union型を用いたResult Patternの実装
- **@ts-sample/sample-connect-rpc** - Protobuf `oneof` とConnect (gRPC) を用いたContract-firstなResult Pattern

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

### Elasticsearch サンプルの実行

```bash
# Elasticsearchを起動
docker-compose up -d elasticsearch kibana

# サンプルアプリケーションを実行
cd packages/sample-elasticsearch-app
pnpm start
```

Kibanaは http://localhost:5601 でアクセスできます。

## やりたいこと（順次更新）

- AI活用
  - [ ] Calude Codeの活用
- 開発
  - [ ] ヘキサゴナルアーキテクチャ
  - [ ] 関数型プログラミング
  - [x] Result型の実装
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