# Result型ライブラリ比較: neverthrow vs effect-ts vs fp-ts

このドキュメントでは、3つの異なるResult型ライブラリを使用した実装を比較します。

## 対象ライブラリ

1. **neverthrow** (`packages/sample-byethrow/`)
2. **effect-ts** (`packages/sample-effect-ts/`)
3. **fp-ts** (`packages/sample-fp-ts/`)

## 実装内容

各パッケージで同じユーザー登録ロジックを実装しました：

- **バリデーション**: メールアドレスと名前の検証
- **重複チェック**: 既存ユーザーの確認
- **データ保存**: ユーザー情報のDB保存（モック）

## 比較結果

### 1. neverthrow

**特徴**:
- 軽量（~5KB）でシンプルなAPI
- `Result<T, E>` と `ResultAsync<T, E>` を提供
- Rustの Result型に触発された設計
- async/awaitとの親和性が高い

**型推論**:
- ✅ 優秀な型推論
- ✅ エラー型の自動追跡
- ⚠️ 場合によっては手動での型のwideningが必要

**非同期処理**:
- ✅ async/awaitと自然に統合
- ✅ `ResultAsync`で関数型スタイルも可能
- ✅ 学習コストが低い

**可読性**:
```typescript
const result = await validateInput(input);
if (result.isErr()) {
  return err(result.error);
}
```

**ボイラープレート**:
- ✅ 最小限のボイラープレート
- ✅ シンプルなAPI

**学習コスト**: ⭐⭐ (低)

---

### 2. effect-ts

**特徴**:
- 高機能で包括的なエコシステム
- `Effect<Success, Error, Requirements>` 型
- 依存性注入、リトライ、タイムアウトなど豊富な機能
- アクティブな開発コミュニティ

**型推論**:
- ✅ 非常に優れた型推論
- ✅ エラー型が自動的に追跡される
- ✅ タグ付きエラーでパターンマッチングが簡単

**非同期処理**:
- ✅ 強力な非同期処理サポート
- ✅ `Effect.runPromise`で実行
- ⚠️ Effectの概念理解が必要

**可読性**:
```typescript
return pipe(
  validateInput(input),
  Effect.flatMap((validatedInput) => ...),
  Effect.flatMap((validatedInput) => ...)
)
```

**ボイラープレート**:
- ⚠️ シンプルなケースではやや冗長
- ✅ 複雑なケースでは強力

**学習コスト**: ⭐⭐⭐⭐ (高)

---

### 3. fp-ts

**特徴**:
- TypeScriptの標準的な関数型プログラミングライブラリ
- `Either<E, A>` と `TaskEither<E, A>` を提供
- ScalaやHaskellに触発された設計
- 成熟したエコシステム

**型推論**:
- ✅ 強力な型推論
- ✅ `chainW` (widen) でエラー型の拡張が可能
- ⚠️ 複雑な型署名になりがち

**非同期処理**:
- ✅ `TaskEither`で非同期処理をサポート
- ✅ pipeベースの合成
- ⚠️ 関数型プログラミングの知識が必要

**可読性**:
```typescript
return pipe(
  validateInput(input),
  TE.chainW((validatedInput) => ...),
  TE.chainW((validatedInput) => ...)
)
```

**ボイラープレート**:
- ⚠️ モジュールのインポートが多い
- ⚠️ pipe関数の使用が必須

**学習コスト**: ⭐⭐⭐⭐ (高)

---

## 推奨用途

### neverthrowが適している場合
- シンプルなエラーハンドリングが必要
- 学習コストを抑えたい
- 既存のasync/awaitコードに統合したい
- バンドルサイズを小さく保ちたい

### effect-tsが適している場合
- 複雑なビジネスロジックを扱う
- リトライ、タイムアウト、並行処理などが必要
- 依存性注入パターンを使いたい
- 最新の関数型プログラミング手法を採用したい

### fp-tsが適している場合
- 関数型プログラミングの経験がある
- 既にfp-tsを使用しているプロジェクト
- 型安全性を最優先したい
- ScalaやHaskellの経験がある

## パフォーマンス比較

| ライブラリ | バンドルサイズ | 実行速度 |
|----------|--------------|---------|
| neverthrow | ~5KB | ⭐⭐⭐⭐⭐ |
| effect-ts | ~100KB+ | ⭐⭐⭐ |
| fp-ts | ~50KB | ⭐⭐⭐⭐ |

## まとめ

**初心者向け**: neverthrow - シンプルで学習しやすい

**中級者向け**: fp-ts - 関数型プログラミングの標準

**上級者向け**: effect-ts - 高機能で最新の手法

## 実行方法

各パッケージのテストを実行:

```bash
# neverthrow
cd packages/sample-byethrow && pnpm test

# effect-ts
cd packages/sample-effect-ts && pnpm test

# fp-ts
cd packages/sample-fp-ts && pnpm test
```

全パッケージのビルド:

```bash
pnpm build
```
