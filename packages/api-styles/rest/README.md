# rest

Hono と `@hono/zod-openapi` を使った REST API のサンプルです。

## 概要

- **スキーマが起点**: zod のスキーマ（`schema.ts`）から、入力の検証・TypeScript の型・OpenAPI ドキュメントをまとめて得る
- **成功・失敗は HTTP ステータスで表す**: 201（登録成功）/ 400（入力不正）/ 409（登録済み）。ステータスごとにボディの型が決まる
- **クライアントは型を import するだけ**: サーバーの `AppType` を `hc<AppType>()` に渡すと、パス・リクエスト・レスポンスの型が付く（コード生成なし）

## ファイル構成

```
packages/api-styles/rest/
├── schema.ts        # zod スキーマ（リクエスト / User / ValidationError / ConflictError）
├── server.ts        # ルート定義（POST /users）と OpenAPI ドキュメント（/openapi.json）
├── client.ts        # hc クライアントでの呼び出しとステータスによる分岐
├── dev-server.ts    # Node で起動する開発サーバー
└── server.test.ts   # テスト（型の絞り込みも expectTypeOf で検証）
```

## 使用例

```typescript
const res = await client.users.$post({ json: { email, name } });

switch (res.status) {
  case 201: {
    const user = await res.json(); // User 型
    break;
  }
  case 400: {
    const error = await res.json(); // ValidationError 型（field で原因の項目がわかる）
    break;
  }
  case 409: {
    const error = await res.json(); // ConflictError 型
    break;
  }
  default: {
    const _exhaustive: never = res; // 宣言していないステータスはコンパイルエラー
  }
}
```

`res.status` で分岐すると、ルート定義で宣言したスキーマに合わせて `res.json()` の型が絞り込まれます。

## 他の API スタイルとの違い

- tRPC / GraphQL / Connect のサンプルは、業務エラーも「成功した通信」としてボディの型（Union など）で返しています。
- REST では HTTP の意味論に沿って**ステータスコードで成否を表し**、判別キーもボディの中ではなく `res.status` になります。キャッシュや監視、HTTP クライアントの既定の挙動（`fetch` の `res.ok` など）と素直に噛み合うのが利点です。
- OpenAPI ドキュメントがルート定義から生成されるため、TypeScript 以外のクライアント向けにコード生成することもできます（tRPC にはない利点）。

## 実行方法

> コマンドはパッケージのディレクトリ（`packages/api-styles`）で実行します。

```bash
pnpm test rest   # テスト
pnpm dev:rest    # 開発サーバー（http://localhost:3000）
```

開発サーバーの起動後:

```bash
curl -X POST localhost:3000/users -H 'content-type: application/json' -d '{"email":"a@example.com","name":"A"}'
curl localhost:3000/openapi.json
```

## 補足

`@hono/zod-openapi` 1.x は zod v4 が必要なため、このパッケージでは zod v4 を直接依存に入れています（リポジトリ共通の catalog は zod v3）。
