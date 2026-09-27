# rest

Hono と `@hono/zod-openapi` を使った REST API のサンプルです。API の仕様（エラーコードなど）は [`../README.md`](../README.md) を参照してください。

## 特徴

- **スキーマが起点**: zod のスキーマ（`schema.ts`）から、リクエストの形の検証・TypeScript の型・OpenAPI ドキュメントをまとめて得る
- **成功・失敗は HTTP ステータスで表す**: ステータスごとにボディの型を宣言する
- **クライアントは型を import するだけ**: サーバーの `AppType` を `hc<AppType>()` に渡すと、パス・リクエスト・レスポンスの型が付く（コード生成なし）

| エンドポイント | ステータス | ボディ |
|---|---|---|
| `POST /users` | 201 / 400 / 409 | `User` / `ValidationError` / `EmailAlreadyExistsError` |
| `GET /users/{id}` | 200 / 404 | `User` / `UserNotFoundError` |
| `GET /openapi.json` | 200 | OpenAPI ドキュメント（ルート定義から生成） |

## ファイル構成

```
rest/
├── schema.ts        # zod スキーマ（リクエスト / レスポンス / エラー）
├── server.ts        # ルート定義。ドメインの結果を HTTP ステータスに変換する
├── client.ts        # hc クライアントと、ステータスによる分岐
├── dev-server.ts    # Node で起動する開発サーバー
└── server.test.ts   # REST 固有のテスト（型の絞り込み、ステータス、OpenAPI）
```

## 使用例

```typescript
const res = await client.users.$post({ json: { email, name } });

switch (res.status) {
  case 201: { const user = await res.json(); break; }   // User 型
  case 400: { const error = await res.json(); break; }  // ValidationError 型
  case 409: { const error = await res.json(); break; }  // EmailAlreadyExistsError 型
  default: { const _exhaustive: never = res; }           // 宣言していないステータスはコンパイルエラー
}

const found = await client.users[':id'].$get({ param: { id: 'user-1' } }); // 200 or 404
```

`res.status` で分岐すると、ルート定義で宣言したスキーマに合わせて `res.json()` の型が絞り込まれます。

## 補足

- メールアドレスの形式などの業務ルールは全スタイル共通のドメイン（`../domain`）で判定し、zod ではリクエストの形（文字列であること）だけを検証しています。形が不正な場合も 400 と `ValidationError` を返します。
- HTTP の意味論に沿っているため、キャッシュや監視、`fetch` の `res.ok` などと素直に噛み合います。OpenAPI から TypeScript 以外のクライアントを生成することもできます。
- `@hono/zod-openapi` 1.x は zod v4 が必要なため、このパッケージでは zod v4 を直接依存に入れています（リポジトリ共通の catalog は zod v3）。

## 実行方法

```bash
cd packages/api-styles
pnpm test rest   # REST 固有のテスト（仕様のテストは pnpm test contract）
pnpm dev:rest    # 開発サーバー（http://localhost:3000）

curl -X POST localhost:3000/users -H 'content-type: application/json' -d '{"email":"a@example.com","name":"A"}'
curl localhost:3000/users/user-1
curl localhost:3000/openapi.json
```
