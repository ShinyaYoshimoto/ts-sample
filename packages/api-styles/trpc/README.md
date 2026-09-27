# trpc

tRPC で、サーバー側で定義した Result 型（Discriminated Union）をクライアントでそのまま扱うサンプルです。API の仕様（エラーコードなど）は [`../README.md`](../README.md) を参照してください。

## 特徴

- **型の共有**: クライアントはサーバーの `AppRouter` 型を import するだけで、手続き名・入力・出力に型が付く（コード生成なし）
- **業務エラーは Result で返す**: `TRPCError` を throw せず、`{ status: 'ok', data } | { status: 'error', error }` を通常のレスポンスとして返す
- **コマンドとクエリ**: `registerUser` は `mutation`（POST）、`getUser` は `query`（GET）
- **入力の形の検証**: zod で行い、形が不正な場合だけ tRPC 標準の `BAD_REQUEST`（`TRPCClientError`）になる

## ファイル構成

```
trpc/
├── result.ts          # Result 型（Success / Failure）とヘルパー
├── types.ts           # ドメインの型の再エクスポート
├── server.ts          # ルーター（mutation / query）。ドメインの結果を Result に変換する
├── client.ts          # tRPC クライアント（fetch を差し替え可能）
├── fetch-handler.ts   # Fetch API の Request をルーターで処理するハンドラー
└── server.test.ts     # tRPC 固有のテスト（型の絞り込み、GET / POST、TRPCError との境界）
```

## 使用例

```typescript
const result = await client.registerUser.mutate({ email, name });

if (result.status === 'ok') {
  result.data;        // User 型
} else {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':     result.error.field; break; // 'email' | 'name'
    case 'EMAIL_ALREADY_EXISTS': break;
  }
}

const found = await client.getUser.query({ id: 'user-1' }); // Result<User, UserNotFoundError>
```

## 補足

HTTP ステータスは業務エラーでも 200 のままです。成否はボディの `status` で判別します。
HTTP の意味論（キャッシュや監視）と揃えたい場合は REST、TypeScript 同士で型を最短距離で共有したい場合は tRPC、という使い分けになります。

## 実行方法

```bash
cd packages/api-styles
pnpm test trpc   # tRPC 固有のテスト（仕様のテストは pnpm test contract）
```
