# user-domain

ユーザーの登録（コマンド）と取得（クエリ）のドメインです。業務ルールとエラー仕様をここだけで定義し、複数のサンプルから使います。

- [`api-styles`](../../api-styles): REST / tRPC / GraphQL / Connect の各 API から呼び出す
- [`pubsub`](../../pubsub): 登録後に `UserRegistered` イベントを発行する

## 仕様

| 操作 | 成功 | エラー |
|---|---|---|
| `registerUser({ email, name })` | `User`（ID は `user-1`, `user-2`, … と採番。前後の空白は除く） | `VALIDATION_ERROR` / `EMAIL_ALREADY_EXISTS` |
| `getUser(id)` | `User` | `USER_NOT_FOUND` |

| エラーコード | 条件 | `field` | `message` |
|---|---|---|---|
| `VALIDATION_ERROR` | メールアドレスが空 | `email` | `Email is required` |
| `VALIDATION_ERROR` | メールアドレスに `@` がない | `email` | `Invalid email format` |
| `VALIDATION_ERROR` | 名前が空（空白のみを含む） | `name` | `Name is required` |
| `EMAIL_ALREADY_EXISTS` | 登録済みのメールアドレス | - | `User with this email already exists` |
| `USER_NOT_FOUND` | 指定した ID のユーザーがいない | - | `User not found` |

結果は例外ではなく `Result`（`{ ok: true, value } | { ok: false, error }`）で返します。
ストアはメモリ上にあり、`createUserService()` を呼ぶたびに独立したストアになります。

## 使い方

```typescript
import { createUserService } from '@ts-sample/user-domain';

const service = createUserService();
const result = service.registerUser({ email: 'alice@example.com', name: 'Alice' });
if (result.ok) {
  service.getUser(result.value.id);
}
```

他のパッケージからは `dist/` を参照するため、先にビルドが必要です（`pnpm build`。CI では自動でビルドされます）。
