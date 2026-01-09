# sample-effect-ts

このパッケージは、TypeScript向けの強力な関数型プログラミングライブラリ **Effect** を使用したエラーハンドリングを実装したものです。

## 概要

Effectは、TypeScriptで関数型プログラミングを行うための包括的なエコシステムを提供します。以下の機能があります：
- 型システムでの型安全なエラー追跡
- 多くのユーティリティを含む豊富なエコシステム
- 強力な合成オペレーター
- 並行処理、リトライ、タイムアウトなどの組み込みサポート
- サービス/依存性注入パターン

## 実装の特徴

### 1. タグ付きエラー
Effectは、より良い型推論のためにクラスベースのタグ付きエラーを使用します：
```typescript
export class ValidationError {
  readonly _tag = 'ValidationError';
  constructor(readonly message: string) {}
}
```

### 2. Effect型
関数は`Effect<Success, Error, Requirements>`を返します：
```typescript
function validateInput(input: CreateUserInput): Effect.Effect<CreateUserInput, ValidationError>
```

### 3. パイプベースの合成
Effectは合成に関数型パイプを使用します：
```typescript
return pipe(
  validateInput(input),
  Effect.flatMap((validatedInput) => ...),
  Effect.flatMap((validatedInput) => ...)
)
```

## 主な特徴

### 長所
- ✅ 非常に強力で機能豊富
- ✅ 優れた型推論
- ✅ 大規模なユーティリティエコシステム
- ✅ 複雑なパターン（リトライ、タイムアウトなど）の組み込みサポート
- ✅ 活発な開発とコミュニティ
- ✅ サービス/依存性注入が組み込み

### 短所
- ❌ 急な学習曲線
- ❌ 大きなバンドルサイズ（~100KB+）
- ❌ 関数型プログラミングの概念理解が必要
- ❌ シンプルなケースでは多くのボイラープレート

## 使用例

```typescript
const effect = registerUser({ email: "test@example.com", name: "Test" });

// オプション1: ヘルパーを使用
const result = await runEffect(effect);
if (result.success) {
  console.log("ユーザー登録成功:", result.value);
} else {
  console.error("エラー:", result.error);
}

// オプション2: Effect.runPromiseを直接使用
try {
  const user = await Effect.runPromise(effect);
  console.log("ユーザー登録成功:", user);
} catch (error) {
  console.error("エラー:", error);
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

## 詳細情報

- [Effect ドキュメント](https://effect.website/)
- [Effect 例](https://github.com/Effect-TS/effect/tree/main/packages/effect/examples)
