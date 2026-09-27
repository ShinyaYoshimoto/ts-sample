/**
 * GraphQL スキーマ
 *
 * 成功と失敗を Union 型で表す。エラーの型は共通のインターフェース AppError を実装するため、
 * クライアントは `... on AppError { code message }` で共通の項目をまとめて受け取れる。
 */
export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    name: String!
  }

  interface AppError {
    code: String!
    message: String!
  }

  type ValidationError implements AppError {
    code: String!
    message: String!
    field: String!
  }

  type EmailAlreadyExistsError implements AppError {
    code: String!
    message: String!
  }

  type UserNotFoundError implements AppError {
    code: String!
    message: String!
  }

  union RegisterUserResult = User | ValidationError | EmailAlreadyExistsError
  union UserResult = User | UserNotFoundError

  type Query {
    "クエリ（副作用なし）: ID でユーザーを取得する"
    user(id: ID!): UserResult!
  }

  type Mutation {
    "コマンド（副作用あり）: ユーザーを登録する"
    registerUser(email: String!, name: String!): RegisterUserResult!
  }
`;
