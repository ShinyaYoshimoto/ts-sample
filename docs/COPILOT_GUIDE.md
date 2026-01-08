# Copilot（自動コード変更エージェント）利用ガイド

## 目的

このドキュメントは、リポジトリ内で GitHub Copilot / コーディングエージェントを使って変更（ファイル追加・移動・PR 作成）する際のルールと手順を示します。

## 適用範囲

- ts-sample リポジトリのモノレポ移行作業（pnpm workspaces、packages 配下への移動、prisma の移動、CI 追加等）
- 今後 Copilot に PR 作成を依頼する際のテンプレートとレビュー基準

## 基本ルール

1. **変更は小さなコミットに分ける**
   - 移動は `git mv` を使う
   - 履歴を保持し、レビューしやすくする

2. **既存ファイルの上書きは最小限に**
   - 重要な上書きは差分提示・承認を得る
   - 意図しない変更を防ぐ

3. **ルートの依存は最小限に**
   - `workspace:*` を活用する
   - パッケージ間の依存関係を明確にする

4. **ビルドとテストが通ることを確認する**
   - 変更後は必ず `pnpm build` と `pnpm test` を実行
   - CI が正常に動作することを確認

5. **秘密情報を含めない**
   - `.env` や secrets をリポジトリに含めない
   - 機密情報は環境変数で管理

## 作業フロー（Copilot に PR を作成させるとき）

1. **依頼者が目的と範囲を明確に記述する**
   - [PR_CREATION_TEMPLATE.md](./PR_CREATION_TEMPLATE.md) を参照
   - 何を、なぜ、どのように変更するかを明示

2. **Copilot は差分プレビューを提示する**
   - 変更ファイル一覧と主要内容を提示
   - 依頼者が変更内容を確認

3. **依頼者が承認後、Copilot がブランチを作成しコミット**
   - 適切なブランチ名で新規ブランチを作成
   - 意味のあるコミットメッセージで変更を記録

4. **PR を作成する**
   - PR タイトルと説明を適切に記述
   - 自動チェック（pnpm install / build / test）が実行される

5. **レビュー担当が PR_REVIEW_CHECKLIST.md に沿ってレビューする**
   - [PR_REVIEW_CHECKLIST.md](./PR_REVIEW_CHECKLIST.md) 参照
   - 変更内容が要件を満たしているか確認

## 移行時の注意点（prisma / docker / .env）

### Prisma の移動

- Prisma は `packages/prisma` に配置
- `schema.prisma` はそのまま利用
- 接続情報はルートの `.env` を参照
- `git mv` で履歴を保持して移動

### Docker Compose

- `docker-compose.yml` はルートに配置
- ローカル起動を一元化
- 各サービスの設定は適切に記述

### 環境変数

- `.env` ファイルはリポジトリに含めない
- `.env.example` で必要な変数を示す
- 機密情報は環境変数で管理

## 推奨コマンド一覧

### 依存関係のインストール

```bash
# ルートで依存インストール（厳密なバージョン固定）
pnpm install --frozen-lockfile
```

### ビルド

```bash
# 全パッケージビルド
pnpm -r run build

# または
pnpm build

# 個別パッケージのビルド
pnpm --filter @ts-sample/<package-name> run build
```

### テスト

```bash
# 全パッケージテスト
pnpm -r run test --run

# または
pnpm test

# 個別パッケージのテスト
pnpm --filter @ts-sample/<package-name> run test
```

### Lint / Format

```bash
# 全パッケージの lint
pnpm lint

# Biome でフォーマット
pnpm format:biome

# Biome で lint
pnpm lint:biome

# Biome でチェックと修正
pnpm check:biome

# Prettier でフォーマット
pnpm format:prettier
```

### Prisma

```bash
# スキーマから Prisma Client を生成
pnpm --filter @ts-sample/prisma run generate

# マイグレーション作成
pnpm --filter @ts-sample/prisma run migrate:dev

# マイグレーション適用
pnpm --filter @ts-sample/prisma run migrate:deploy
```

## PR 作成テンプレート

Copilot に PR 作成を依頼する際は、[PR_CREATION_TEMPLATE.md](./PR_CREATION_TEMPLATE.md) を参照してください。

## レビュー向けチェックリスト

PR をレビューする際は、[PR_REVIEW_CHECKLIST.md](./PR_REVIEW_CHECKLIST.md) を参照してください。

## 参考リンク

- [pnpm workspaces](https://pnpm.io/workspaces)
- [GitHub Copilot](https://github.com/features/copilot)
- [Biome](https://biomejs.dev/)
