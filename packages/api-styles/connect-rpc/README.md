# connect-rpc

Connect（gRPC 互換）と Protocol Buffers で、契約ファースト（Contract-first）に Result パターンを表すサンプルです。API の仕様（エラーコードなど）は [`../README.md`](../README.md) を参照してください。

## 特徴

- **契約は `.proto`**: `proto/user/v1/user.proto` からサーバー・クライアント両方の型を `buf generate` で生成する
- **成功と失敗は `oneof`**: `oneof result { User user; ErrorDetail error; }` が TypeScript では `result.case` を判別キーにした Union になる
- **エラーは1つのメッセージ型**: `ErrorDetail { code, message, optional field }`。`code` は文字列なので、種類ごとの型の区別はない
- **コマンドとクエリ**: `GetUser` に `idempotency_level = NO_SIDE_EFFECTS` を付けると、クライアント（`useHttpGet: true`）は HTTP GET で送る

## Protobuf（抜粋）

```protobuf
message ErrorDetail {
  string code = 1;
  string message = 2;
  optional string field = 3;
}

message RegisterUserResponse { oneof result { User user = 1; ErrorDetail error = 2; } }
message GetUserResponse      { oneof result { User user = 1; ErrorDetail error = 2; } }

service UserService {
  rpc RegisterUser(RegisterUserRequest) returns (RegisterUserResponse);
  rpc GetUser(GetUserRequest) returns (GetUserResponse) {
    option idempotency_level = NO_SIDE_EFFECTS;
  }
}
```

## ファイル構成

```
connect-rpc/
├── proto/user/v1/user.proto     # 契約
├── buf.yaml / buf.gen.yaml      # buf の設定（lint: STANDARD）
├── generated/                   # 生成コード（gitignore。pnpm generate / pnpm install で生成）
├── src/server/user-service.ts   # サービスの実装。ドメインの結果を oneof に変換する
├── src/client/user-client.ts    # クライアントとトランスポート（fetch を差し替え可能）
└── connect.test.ts              # Connect 固有のテスト（oneof の絞り込み、GET / POST、optional field）
```

## 使用例

```typescript
const res = await client.registerUser({ email, name });

switch (res.result.case) {
  case 'user':  res.result.value.id; break;    // User 型
  case 'error': res.result.value.code; break;  // ErrorDetail 型
  default: break;                              // oneof が未設定（Protobuf ではあり得る）
}

const found = await client.getUser({ id: 'user-1' }); // HTTP GET で送られる
```

## 補足

- 業務エラーはレスポンスの `oneof` で返し、認証エラーや通信障害などの基盤のエラーは gRPC の Status（`ConnectError` と `Code`）で表す、という使い分けが一般的です。
- `ErrorDetail.code` を文字列ではなく種類ごとのメッセージ型（`oneof` のメンバーを増やす）にすると、GraphQL の Union のように型で区別できるようになります。

## 実行方法

```bash
cd packages/api-styles
pnpm generate       # .proto から TypeScript を生成
pnpm test connect   # Connect 固有のテスト（仕様のテストは pnpm test contract）
```

スパイク実施時の記録は [`TECH_SPIKE_SUMMARY.md`](TECH_SPIKE_SUMMARY.md) にあります（当時の仕様のままです）。
