# sample-neverthrow

このパッケージは、TypeScript向けの軽量Result型ライブラリ **neverthrow** を使用したエラーハンドリングを実装したものです。

## 概要

neverthrowは、`throw`文を使用せずに`Result<T, E>`型（Rustの Resultに類似）を提供します。以下の機能があります：
- 型安全なエラーハンドリング
- 関数シグネチャでの明示的なエラー型
- シンプルで軽量なAPI
- async/awaitとの良好な統合

## 実装の特徴

### 1. 基本的なResultパターン
```typescript
async function validateInput(input: CreateUserInput): Promise<Result<CreateUserInput, ValidationError>>
```

### 2. エラーの合成
`registerUser`関数は逐次的なエラーハンドリングを示しています：
```typescript
export async function registerUser(
  input: CreateUserInput,
): Promise<Result<User, AppError>>
```

### 3. 関数型合成（代替実装）
`registerUserFunctional`はneverthrowの`ResultAsync`による関数型チェイニングを示しています：
```typescript
return ResultAsync.fromPromise(validateInput(input), ...)
  .andThen((validatedInput) => ...)
  .andThen((validatedInput) => ...)
```

## 主な特徴

### 長所
- ✅ 非常に軽量（~5KB）
- ✅ シンプルで直感的なAPI
- ✅ 優れたTypeScript型推論
- ✅ async/awaitとの良好な連携
- ✅ 低い学習コスト

### 短所
- ❌ effect-tsと比べて小さいエコシステム
- ❌ fp-tsより弱い合成ツール
- ❌ 一部のケースで手動のエラー型拡張が必要

## 使用例

```typescript
const result = await registerUser({ email: "test@example.com", name: "Test" });

if (result.isOk()) {
  console.log("ユーザー登録成功:", result.value);
} else {
  console.error("エラー:", result.error);
}
```

## テストの実行

```bash
pnpm test
```

## ビルド

```bash
pnpm build
```
