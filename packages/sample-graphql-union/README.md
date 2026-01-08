# GraphQL Union-based Result Pattern

このパッケージは、GraphQLのUnion型を用いたスキーマレベルでの成功・失敗パターン（Result Pattern）の実装例です。

## 概要

GraphQLのUnion型を活用することで、バックエンドとフロントエンド間で型安全なエラーハンドリングを実現します。コード生成ツールを使わずに、`__typename`フィールドを用いた型の絞り込み（Type Narrowing）を実装しています。

## アーキテクチャ

### GraphQLスキーマ

```graphql
type User {
  id: ID!
  email: String!
  name: String!
}

type ValidationError {
  message: String!
  field: String
}

type ConflictError {
  message: String!
  conflictingId: ID
}

union RegisterUserResult = User | ValidationError | ConflictError

type Mutation {
  registerUser(email: String!, name: String!): RegisterUserResult!
}
```

### 主要な概念

1. **Union型**: 複数の異なる型を1つの返り値として定義
2. **`__typename`**: GraphQLが自動的に提供する型識別子
3. **Type Narrowing**: TypeScriptの型ガードを用いた型の絞り込み
4. **Schema-first**: スキーマを中心としたAPI設計

## ディレクトリ構造

```
src/
├── schema.ts           # GraphQLスキーマ定義
├── resolvers.ts        # サーバーサイドのリゾルバ実装
├── resolvers.test.ts   # サーバーサイドのテスト
├── server.ts           # GraphQL Yogaサーバー
├── client.ts           # クライアントサイドの型安全なハンドリング
└── client.test.ts      # クライアントサイドのテスト
```

## 使い方

### サーバーの起動

```bash
pnpm install
pnpm dev
```

サーバーは `http://localhost:4000/graphql` で起動します。

### GraphQLクエリの例

#### 成功ケース

```graphql
mutation {
  registerUser(email: "test@example.com", name: "Test User") {
    __typename
    ... on User {
      id
      email
      name
    }
    ... on ValidationError {
      message
      field
    }
    ... on ConflictError {
      message
      conflictingId
    }
  }
}
```

レスポンス:
```json
{
  "data": {
    "registerUser": {
      "__typename": "User",
      "id": "user-1",
      "email": "test@example.com",
      "name": "Test User"
    }
  }
}
```

#### バリデーションエラー

```graphql
mutation {
  registerUser(email: "invalid-email", name: "Test") {
    __typename
    ... on ValidationError {
      message
      field
    }
  }
}
```

レスポンス:
```json
{
  "data": {
    "registerUser": {
      "__typename": "ValidationError",
      "message": "Invalid email format",
      "field": "email"
    }
  }
}
```

#### コンフリクトエラー

既に登録済みのメールアドレスで登録を試みた場合:

```json
{
  "data": {
    "registerUser": {
      "__typename": "ConflictError",
      "message": "User with this email already exists",
      "conflictingId": "user-1"
    }
  }
}
```

## クライアントサイドの型安全な実装

### Switch文による型の絞り込み

```typescript
import { handleRegisterUserResult } from './client';

const result = await registerUser('test@example.com', 'Test User');

switch (result.__typename) {
  case 'User':
    // TypeScriptはここでresultがUser型であることを理解
    console.log(`Success! User ID: ${result.id}`);
    break;
    
  case 'ValidationError':
    // TypeScriptはここでresultがValidationError型であることを理解
    console.log(`Validation failed: ${result.message}`);
    break;
    
  case 'ConflictError':
    // TypeScriptはここでresultがConflictError型であることを理解
    console.log(`Conflict: ${result.message}`);
    break;
}
```

### Type Predicateの活用

```typescript
import { isUser, isValidationError, isConflictError } from './client';

if (isUser(result)) {
  // resultはUser型として扱える
  console.log(result.email);
}

if (isValidationError(result)) {
  // resultはValidationError型として扱える
  console.log(result.field);
}
```

### 複数結果の処理

```typescript
import { processRegistrations } from './client';

const results = [result1, result2, result3];
const { successful, validationErrors, conflictErrors } = processRegistrations(results);

console.log(`${successful.length} users registered`);
console.log(`${validationErrors.length} validation errors`);
console.log(`${conflictErrors.length} conflicts`);
```

## テストの実行

```bash
pnpm test
```

テストでは以下を検証しています：

### サーバーサイド (`resolvers.test.ts`)

- ✅ 正常なユーザー登録
- ✅ メールアドレスのバリデーション
- ✅ 名前のバリデーション（空文字、短すぎる名前）
- ✅ 重複メールアドレスの検出
- ✅ Union型の`__typename`解決

### クライアントサイド (`client.test.ts`)

- ✅ `__typename`による型の絞り込み
- ✅ Switch文を用いたハンドリング
- ✅ Type Guardを用いたハンドリング
- ✅ 複数結果の分類処理
- ✅ Type Predicateの動作
- ✅ コンパイル時の型安全性と網羅性チェック

## 検証ポイント

### 1. スキーマ駆動の型共有

✅ GraphQLスキーマが真の情報源として機能
- バックエンドのリゾルバはスキーマに従った型を返却
- フロントエンドは同じスキーマ定義から型を推論
- コード生成なしでも十分な型安全性を確保

### 2. 複数エラー型のメンテナンス性

✅ 新しいエラー型の追加が容易
- スキーマに新しい型を追加
- Unionに型を追加
- クライアントのswitch文に新しいケースを追加
- TypeScriptの網羅性チェックにより、漏れを防止

例：新しいエラー型の追加
```graphql
type RateLimitError {
  message: String!
  retryAfter: Int!
}

union RegisterUserResult = User | ValidationError | ConflictError | RateLimitError
```

### 3. `__typename`の利点

- GraphQLが自動的に提供（追加実装不要）
- 型判別の明示的な方法
- TypeScriptの型ガードと完全に互換

### 4. コード生成なしの型安全性

このサンプルでは意図的にGraphQL Code Generatorなどのツールを使用せず、手動で型定義を記述しています。これにより：

- ✅ スキーマから型への変換が理解しやすい
- ✅ ツールへの依存が少ない
- ✅ 学習曲線が緩やか
- ⚠️ スキーマと型定義の同期は手動管理が必要

実際のプロダクションでは、GraphQL Code Generatorの使用を推奨します。

## ビルド

```bash
pnpm build
```

TypeScriptコードは`dist/`ディレクトリにコンパイルされます。

## 技術スタック

- **GraphQL Yoga**: モダンで軽量なGraphQLサーバー
- **TypeScript**: 型安全性
- **Vitest**: 高速なユニットテスト

## 参考資料

- [GraphQL Union Types](https://graphql.org/learn/schema/#union-types)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)
- [GraphQL Yoga Documentation](https://the-guild.dev/graphql/yoga-server)
