# 概要

- Typescriptを用いたサンプルコード集
- 良し悪しはともかくやってみたいことやってみる

## モノレポ構成

このリポジトリはpnpm workspaceを使用したモノレポ構成になっています。

### Packages

- **@ts-sample/sample-gemini** - Gemini APIを使ったサンプル（React + Vite）
- **@ts-sample/sample-hexagonal-architecture** - ヘキサゴナルアーキテクチャのサンプル実装
- **@ts-sample/sample-immutable-data-model** - イミュータブルデータモデルのサンプル
- **@ts-sample/sample-zod** - Zodを使ったバリデーションのサンプル
- **@ts-sample/prisma** - Prismaスキーマとマイグレーション

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
```

## やりたいこと（順次更新）

- AI活用
  - [ ] Calude Codeの活用
- 開発
  - [ ] ヘキサゴナルアーキテクチャ
  - [ ] 関数型プログラミング
  - [ ] Result型の実装
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
  - [ ] elasticsearch
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