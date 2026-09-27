# graphql-union

GraphQL の Union 型で、成功と失敗をスキーマレベルで表すサンプルです（サーバーは GraphQL Yoga）。API の仕様（エラーコードなど）は [`../README.md`](../README.md) を参照してください。

## 特徴

- **成功と失敗を Union で表す**: `RegisterUserResult = User | ValidationError | EmailAlreadyExistsError`、`UserResult = User | UserNotFoundError`
- **エラーの共通インターフェース**: エラーの型は `interface AppError { code, message }` を実装するため、クライアントは `... on AppError { code message }` でまとめて受け取れる
- **判別は `__typename`**: switch や if で Union のメンバーごとに型が絞り込まれる
- **コマンドとクエリ**: `Mutation.registerUser` と `Query.user(id)`
- **クライアントは手書き**: このサンプルでは GraphQL Code Generator を使わず、クエリ結果の型を手で書いている

## スキーマ（抜粋）

```graphql
interface AppError { code: String!  message: String! }

type ValidationError implements AppError { code: String!  message: String!  field: String! }
type EmailAlreadyExistsError implements AppError { code: String!  message: String! }
type UserNotFoundError implements AppError { code: String!  message: String! }

union RegisterUserResult = User | ValidationError | EmailAlreadyExistsError
union UserResult = User | UserNotFoundError

type Query { user(id: ID!): UserResult! }
type Mutation { registerUser(email: String!, name: String!): RegisterUserResult! }
```

## ファイル構成

```
graphql-union/src/
├── schema.ts          # GraphQL スキーマ
├── resolvers.ts       # リゾルバー。ドメインの結果を Union のメンバーに変換する
├── app.ts             # Yoga アプリの作成と、fetch 互換の関数への変換
├── server.ts          # Node で起動する開発サーバー
├── client.ts          # 手書きの型とクエリ、クライアント
└── graphql.test.ts    # GraphQL 固有のテスト（__typename の絞り込み、フィールド選択、errors との違い）
```

## 使用例

```typescript
const result = await client.registerUser({ email, name });

switch (result.__typename) {
  case 'User':                    result.id; break;    // User 型
  case 'ValidationError':         result.field; break; // ValidationError 型
  case 'EmailAlreadyExistsError': break;
  default: { const _exhaustive: never = result; }       // メンバーの追加漏れはコンパイルエラー
}
```

## 補足

- 業務エラーは `data` の中の Union として返り、スキーマ違反（必須の引数がないなど）は `errors` に入ります。
- Union のメンバーが増えると、手書きの型とクエリの両方を直す必要があります。規模が大きくなったら GraphQL Code Generator でスキーマから型を生成するのが一般的です。

## 実行方法

```bash
cd packages/api-styles
pnpm test graphql   # GraphQL 固有のテスト（仕様のテストは pnpm test contract）
pnpm dev:graphql    # 開発サーバー（http://localhost:4000/graphql）
```
