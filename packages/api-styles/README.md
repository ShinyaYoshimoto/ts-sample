# api-styles

API スタイル（REST / tRPC / GraphQL / Connect RPC）ごとに、同じ「ユーザー API」を実装して**使い方を比較する**パッケージです。
スキーマや型をどこで定義し、サーバーとクライアントでどう共有するか、成功と失敗をどう表し、クライアントがどう判別するかを見比べられます。

言語内（ライブラリ単体）での Result 型の比較は [`../result-type`](../result-type) を参照してください。

## 構成

```
packages/api-styles/
├── domain/            # 全スタイル共通の業務ロジックと仕様（入力チェック・エラー）
├── rest/              # REST (Hono + zod-openapi)
├── trpc/              # tRPC
├── graphql-union/     # GraphQL (Union 型)
├── connect-rpc/       # Connect (gRPC / Protobuf)
├── adapters.ts        # 各スタイルのクライアントを共通の形に揃えるアダプタ
├── contract.test.ts   # 全スタイル共通の仕様テスト
└── demo.ts            # 同じ操作の HTTP のやり取りを横並びで表示するデモ
```

各スタイルは `domain/` のサービスを呼び出し、結果をそのスタイルの流儀に変換するだけの薄い層です。
業務ルールを1か所にまとめているので、**違いは API スタイルの部分だけ**になります。

## API の仕様（全スタイル共通）

| 操作 | 種類 | 成功 | エラー |
|---|---|---|---|
| `registerUser(email, name)` | コマンド（副作用あり） | `User` | `VALIDATION_ERROR` / `EMAIL_ALREADY_EXISTS` |
| `getUser(id)` | クエリ（副作用なし） | `User` | `USER_NOT_FOUND` |

| エラーコード | 条件 | `field` | `message` |
|---|---|---|---|
| `VALIDATION_ERROR` | メールアドレスが空 | `email` | `Email is required` |
| `VALIDATION_ERROR` | メールアドレスに `@` がない | `email` | `Invalid email format` |
| `VALIDATION_ERROR` | 名前が空（空白のみを含む） | `name` | `Name is required` |
| `EMAIL_ALREADY_EXISTS` | 登録済みのメールアドレス | - | `User with this email already exists` |
| `USER_NOT_FOUND` | 指定した ID のユーザーがいない | - | `User not found` |

`User` は `{ id, email, name }` で、ID は登録順に `user-1`, `user-2`, … と振られます。

## 比較

| | REST（Hono + zod-openapi） | tRPC | GraphQL（Union） | Connect（gRPC） |
|---|---|---|---|---|
| 契約（スキーマ）の定義場所 | zod スキーマ（→ OpenAPI を生成） | TypeScript の型（ルーター） | GraphQL スキーマ | `.proto` |
| コマンド / クエリの区別 | HTTP メソッド（`POST /users` / `GET /users/{id}`） | `mutation` / `query` | `Mutation` / `Query` | `NO_SIDE_EFFECTS` を付けた rpc がクエリ |
| クエリの送り方 | GET | GET | POST（GET も可能） | GET（`useHttpGet`） |
| 成否の表し方 | HTTP ステータス（201 / 400 / 409 / 200 / 404） | ボディ（常に 200） | ボディ（常に 200） | ボディ（常に 200） |
| 判別に使うキー | `res.status` | `status`（`'ok'` / `'error'`） | `__typename` | `result.case`（`'user'` / `'error'`） |
| エラーの型 | ステータスごとの型 | エラーコードの Union | Union のメンバー（共通のインターフェース `AppError`） | 1つの `ErrorDetail`（`code` は文字列） |
| クライアントの型 | サーバーの `AppType` を `hc` に渡すだけ | サーバーの `AppRouter` を渡すだけ | 手書き（このサンプルではコード生成を使わない） | `buf generate` で生成 |
| 入力の形の検証 | zod（不正なら 400） | zod（不正なら `TRPCError` の `BAD_REQUEST`） | スキーマ（不正なら `errors`） | Protobuf の型 |
| TypeScript 以外のクライアント | OpenAPI から生成できる | 不可 | 可 | 可 |

REST だけは HTTP の意味論に沿って**ステータスコードで成否を表し**、他の3つは業務上のエラーも**成功した通信のボディの型**として返します。
どのスタイルでも、入力の形そのものが不正な場合（文字列でないなど）は業務エラーではなく、そのスタイル標準のエラー（400 / `TRPCError` / `errors` など）になります。

## 共通仕様テスト（`contract.test.ts`）

各スタイルの正式なクライアントを使い、サーバー（Fetch API のハンドラー）と `fetch` で直結して呼び出します。
実サーバーは立てませんが、実際のシリアライズと HTTP の意味論（メソッド・ステータス）を通ります。
結果を `adapters.ts` で共通の形に揃え、**同じ入力に対して全スタイルが同じ結果を返すこと**を上の仕様の全ケースで検証しています。

入力と結果の対応はこのテストだけで検証し、各スタイルのテストにはそのスタイル固有の使い方（型の絞り込み、GET で送られること、スキーマ違反の扱いなど）だけを書いています。
新しいスタイルを追加するときは、ディレクトリを作って `domain/` を呼び出し、`adapters.ts` にアダプタを1つ足してください。

## 実行方法

```bash
cd packages/api-styles
pnpm test            # 共通仕様テスト + 各スタイルのテスト
pnpm test contract   # 共通仕様テストのみ
pnpm test rest       # 特定のスタイルのテストのみ（trpc / graphql / connect も同様）
pnpm demo            # 同じ操作を各スタイルで実行し、HTTP のやり取りを横並びで表示
pnpm generate        # connect-rpc の .proto から TypeScript を生成（pnpm install 時にも自動実行）

pnpm dev:rest        # REST サーバー（http://localhost:3000、OpenAPI は /openapi.json）
pnpm dev:graphql     # GraphQL サーバー（http://localhost:4000/graphql）
```
