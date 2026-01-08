# sample-trpc

tRPCを使用したクライアント・サーバー間のResult型伝播のサンプル実装です。

## 概要

このサンプルでは、tRPCを使用して、サーバーサイドで定義したResult型（Discriminated Union）をクライアント側でシームレスに扱う方法を実証します。

## 主な特徴

- **自前のResult型**: 外部ライブラリに依存しない、シンプルな `Success<T> | Failure<E>` 型を定義
- **型安全**: tRPCの型推論により、クライアント側でも完全な型安全性を実現
- **TRPCErrorを使わない**: エラーを例外としてthrowせず、正常なレスポンスとしてResultを返す
- **Type Narrowing**: `status` フィールドによる型の絞り込みが機能することを確認

## ファイル構成

```
packages/sample-trpc/
├── result.ts         # Result型とヘルパー関数の定義
├── types.ts          # UserとAppErrorの型定義
├── server.ts         # tRPCサーバーとregisterUserミューテーションの実装
├── client.ts         # tRPCクライアントの作成
├── server.test.ts    # 包括的なテスト
└── README.md         # このファイル
```

## Result型の定義

```typescript
export type Success<T> = {
  status: 'ok';
  data: T;
};

export type Failure<E> = {
  status: 'error';
  error: E;
};

export type Result<T, E> = Success<T> | Failure<E>;
```

## 使用例

### サーバー側

```typescript
export const appRouter = router({
  registerUser: publicProcedure
    .input(...)
    .mutation(async ({ input }): Promise<Result<User, AppError>> => {
      // バリデーション
      if (!input.name || input.name.length < 2) {
        return failure({
          type: 'VALIDATION_ERROR',
          message: 'Name must be at least 2 characters',
        });
      }

      // 成功時
      const newUser: User = { /* ... */ };
      return success(newUser);
    }),
});
```

### クライアント側

```typescript
const response = await client.registerUser.mutate({
  name: 'John Doe',
  email: 'john@example.com',
});

// Type Narrowingが機能する
if (response.status === 'ok') {
  // response.data は User 型として推論される
  console.log(`Welcome, ${response.data.name}!`);
} else {
  // response.error は AppError 型として推論される
  console.error(`Error: ${response.error.type}`);
}
```

## 検証ポイント

### 1. 型の絞り込み（Type Narrowing）

クライアント側で `if (response.status === 'ok')` と書いた際に、TypeScriptが正しく型を絞り込み、`response.data` が `User` 型として補完されることを確認できます。

### 2. TRPCErrorを使わないエラーハンドリング

`TRPCError` を使用せず、すべてのケースで正常なレスポンスとして `Result` を返すため、HTTPステータスコードに依存しないエラーハンドリングが可能です。

### 3. 完全な型安全性

tRPCの型推論により、サーバー側で定義した型がクライアント側でもそのまま使用でき、コンパイル時に型エラーを検出できます。

## テストの実行

```bash
pnpm test
```

## ビルド

```bash
pnpm build
```

## デモの実行

型の絞り込みが動作する様子を確認するデモを実行できます：

```bash
pnpm tsx type-narrowing-demo.ts
```

このデモは以下を実演します：
- 成功ケースでの型の絞り込み
- バリデーションエラーの処理
- 重複メールエラーの処理
- パターンマッチングスタイルのエラーハンドリング
- 包括的なエラータイプの処理

## 結論

この実装により、以下のことが実証されました：

- tRPCを使用することで、Discriminated Unionの型情報がクライアント・サーバー間で完全に伝播する
- `status` フィールドによる型の絞り込みが期待通りに機能する
- TRPCErrorを使わないエラーハンドリングパターンも実用的である
- エラーケースも含めて、完全な型安全性が保たれる
