# api-styles

API スタイル（REST / tRPC / GraphQL / Connect RPC）ごとに、同じ「ユーザー登録」API を実装して**使い方を比較する**パッケージです。
スキーマや型をどこで定義し、サーバーとクライアントでどう共有するか、成功と失敗をクライアントがどう判別するかを見比べられます。

どのサンプルも、業務上のエラー（入力不正・重複など）をクライアント側で型の絞り込みができる形で返しています。
言語内（ライブラリ単体）での Result 型の比較は [`../result-type`](../result-type) を参照してください。

## 構成

```
packages/api-styles/
├── rest/            # REST (Hono + zod-openapi): HTTP ステータスで成否を表し、型は zod スキーマから
├── trpc/            # tRPC: サーバーの型をクライアントがそのまま使う（コード生成なし）
├── graphql-union/   # GraphQL: スキーマの Union 型で結果を表す
└── connect-rpc/     # Connect (gRPC): Protobuf の oneof で結果を表す（buf でコード生成）
```

各ディレクトリに、その方式の詳しい説明（`README.md`）とテストがあります。

## 比較

| | REST（Hono + zod-openapi） | tRPC | GraphQL Union | Connect (gRPC) |
|---|---|---|---|---|
| 契約（スキーマ）の定義場所 | zod スキーマ（→ OpenAPI を生成） | TypeScript の型（`Success<T> \| Failure<E>`） | GraphQL スキーマ（`union RegisterUserResult = User \| ValidationError \| ConflictError`） | `.proto`（`oneof result { User user; ErrorDetail error; }`） |
| 成否の表し方 | HTTP ステータス（201 / 400 / 409） | ボディ（常に成功した通信） | ボディ（常に成功した通信） | ボディ（常に成功した通信） |
| 判別に使うキー | `res.status` | `status`（`'ok'` / `'error'`） | `__typename` | `result.case`（`'user'` / `'error'`） |
| エラーの種類の表し方 | ステータスごとの型（`ValidationError` / `ConflictError`） | `AppError` の `type`（`VALIDATION_ERROR` / `DUPLICATE_EMAIL` / `DATABASE_ERROR`） | Union のメンバーごとに別の型（`ValidationError` / `ConflictError`） | `ErrorDetail.code`（文字列。例: `INVALID_EMAIL`） |
| クライアントの型 | サーバーの `AppType` を `hc` に渡すだけ | サーバーの `AppRouter` 型を import するだけ | 手書き（このサンプルではコード生成を使わない） | `buf generate` で生成 |
| TypeScript 以外のクライアント | OpenAPI から生成できる | 不可（TypeScript 同士のみ） | 可 | 可 |

REST だけは HTTP の意味論に沿って**ステータスコードで成否を表し**、他の3つは業務上のエラーも**成功した通信のボディの型**として返しています（tRPC では `TRPCError` を throw していません）。
認証エラーや通信障害などの基盤のエラーを各方式のエラー機構（gRPC の Status など）と使い分ける考え方は、[`connect-rpc/README.md`](connect-rpc/README.md) で説明しています。

## 実行方法

```bash
cd packages/api-styles
pnpm test                  # 全サンプルのテスト
pnpm test rest             # 特定のサンプルのテストのみ（trpc / graphql-union / connect-rpc も同様）
pnpm generate              # connect-rpc の Protobuf から TypeScript を生成（pnpm install 時にも自動実行）

pnpm dev:rest              # REST サーバーを起動（http://localhost:3000、OpenAPI は /openapi.json）
pnpm demo:trpc             # tRPC の型の絞り込みデモ
pnpm dev:graphql           # GraphQL サーバーを起動（http://localhost:4000/graphql）
pnpm demo:graphql          # GraphQL のエンドツーエンドのデモ（終了は Ctrl+C）
```
