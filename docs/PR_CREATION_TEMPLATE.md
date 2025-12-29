# PR 作成テンプレート（Copilot 依頼用）

このテンプレートは、GitHub Copilot やコーディングエージェントに PR 作成を依頼する際に使用します。

## テンプレート

```markdown
## 目的

<!-- この PR で何を達成するかを明確に記述 -->
<!-- 例: モノレポ構成への移行、新機能の追加、バグ修正など -->

## 背景・理由

<!-- なぜこの変更が必要かを説明 -->
<!-- 例: パッケージ管理を改善するため、etc. -->

## 変更内容

<!-- 具体的な変更内容をリストアップ -->
<!-- 例: -->
- ファイル/ディレクトリの追加
- ファイル/ディレクトリの移動
- 設定ファイルの更新
- 依存関係の追加・変更

## 変更範囲

<!-- どのファイル/ディレクトリに影響があるか -->
<!-- 例: -->
- `packages/` 配下
- ルートの設定ファイル（`package.json`, `pnpm-workspace.yaml`）
- CI 設定（`.github/workflows/`）

## 移動・削除するファイル

<!-- git mv を使用するファイル、削除するファイルをリストアップ -->
<!-- 例: -->
- `src/old-path/file.ts` → `packages/new-package/src/file.ts` (git mv)
- `deprecated/old-file.ts` (削除)

## 追加・変更する依存関係

<!-- 新しく追加する npm パッケージ、変更するバージョンなど -->
<!-- 例: -->
- `@ts-sample/new-package` (新規)
- `zod` を `^3.25.67` に更新

## 確認事項

<!-- PR 作成前に確認すべき事項 -->
- [ ] `pnpm install --frozen-lockfile` が成功する
- [ ] `pnpm build` が成功する
- [ ] `pnpm test` が成功する
- [ ] lint エラーがない（`pnpm lint`）
- [ ] `.env` や secrets を含んでいない
- [ ] `git mv` で移動履歴が保持されている

## 注意点・特記事項

<!-- レビュアーが知っておくべき情報、注意点など -->
<!-- 例: -->
- 既存の動作に影響を与えないことを確認
- 特定のファイルは意図的に残している
- 移行作業の一部であり、後続の PR で完了する

## 関連 Issue

<!-- 関連する Issue があればリンク -->
<!-- 例: Closes #123 -->

## レビュー依頼

<!-- レビュアーに確認してほしいポイント -->
<!-- 例: -->
- ファイル移動が正しく履歴保持されているか
- 依存関係が適切に設定されているか
- ビルドとテストが通るか
```

## 使用例

### 例 1: Prisma パッケージの移行

```markdown
## 目的

Prisma を `packages/prisma` に移動し、モノレポ構成に対応させる。

## 背景・理由

モノレポ構成への移行作業の一環として、Prisma を独立したパッケージとして管理する。

## 変更内容

- `prisma/` ディレクトリを `packages/prisma` に移動
- `packages/prisma/package.json` を作成
- ルートの `package.json` から Prisma 関連の依存を削除
- `pnpm-workspace.yaml` に `packages/prisma` を追加

## 変更範囲

- `prisma/` → `packages/prisma/` (git mv)
- `package.json`
- `pnpm-workspace.yaml`

## 移動・削除するファイル

- `prisma/` → `packages/prisma/` (git mv で移動)

## 追加・変更する依存関係

- `packages/prisma/package.json` に `@prisma/client`, `prisma` を追加

## 確認事項

- [x] `pnpm install --frozen-lockfile` が成功する
- [x] `pnpm build` が成功する（該当パッケージのみ）
- [x] Prisma の生成コマンドが動作する
- [x] `.env` は含まれていない（`.env.example` のみ）

## 注意点・特記事項

- `.env` はルートに配置し、`packages/prisma` からは参照する形にする
- マイグレーションファイルは履歴として保持

## 関連 Issue

<!-- Issue 番号 -->

## レビュー依頼

- git mv で履歴が保持されているか確認してください
- Prisma の生成コマンドが正しく動作するか確認してください
```

### 例 2: 新しいサンプルパッケージの追加

```markdown
## 目的

Effect-TS を使ったサンプルパッケージ `@ts-sample/sample-effect` を追加する。

## 背景・理由

Effect-TS の学習と、関数型プログラミングパターンのサンプル実装のため。

## 変更内容

- `packages/sample-effect` ディレクトリを作成
- `package.json`, `tsconfig.json`, `vitest.config.ts` を追加
- サンプルコードとテストを作成
- ルートの `README.md` にパッケージ情報を追加

## 変更範囲

- `packages/sample-effect/` (新規作成)
- `README.md` (更新)

## 移動・削除するファイル

- なし

## 追加・変更する依存関係

- `packages/sample-effect/package.json` に `effect` を追加

## 確認事項

- [x] `pnpm install --frozen-lockfile` が成功する
- [x] `pnpm --filter @ts-sample/sample-effect run build` が成功する
- [x] `pnpm --filter @ts-sample/sample-effect run test` が成功する
- [x] lint エラーがない

## 注意点・特記事項

- サンプルコードのため、実用的な実装ではなく学習目的のコード

## 関連 Issue

<!-- Issue 番号 -->

## レビュー依頼

- パッケージ構成が他のサンプルと統一されているか確認してください
- サンプルコードが分かりやすいか確認してください
```

## ポイント

1. **目的を明確に**: 何を達成するかを簡潔に記述
2. **背景を説明**: なぜこの変更が必要かを説明
3. **変更内容を具体的に**: ファイル単位で何を変更するかリストアップ
4. **確認事項を明記**: ビルド・テストが通ることを確認
5. **注意点を共有**: レビュアーが知るべき情報を記載

このテンプレートを使うことで、Copilot が適切な PR を作成しやすくなります。
