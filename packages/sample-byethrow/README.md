# sample-byethrow

このパッケージは、TypeScript向けの軽量でツリーシェイク可能なResult型ライブラリ **@praha/byethrow** を使用したエラーハンドリングを実装したものです。

## 概要

@praha/byethrowは、以下の機能を提供するモダンなResult型ライブラリです：
- ツリーシェイク可能で軽量な設計
- オブジェクトベース（クラス不要）
- 同期・非同期操作の一貫したAPI
- `Result.pipe`によるシンプルで読みやすい合成
- 自動的なPromise処理

## 実装の特徴

### 1. シンプルなResult型
```typescript
function validateInput(input: CreateUserInput): Result.Result<CreateUserInput, ValidationError>
```

### 2. パイプベースの合成
`registerUser`関数はクリーンな合成を示しています：
```typescript
export function registerUser(input: CreateUserInput): Result.Result<User, AppError> {
  return Result.pipe(
    validateInput(input),
    Result.andThrough((validated) => checkUserExists(validated.email)),
    Result.andThen((validated) => saveUser(createUser(validated)))
  );
}
```

### 3. 非同期サポート
byethrowは非同期操作を自動的に処理します：
```typescript
export async function registerUserAsync(input: CreateUserInput): Promise<Result.Result<User, AppError>>
```

## 主な特徴

### 長所
- ✅ 軽量でツリーシェイク可能
- ✅ クリーンで一貫したAPI
- ✅ 優れたTypeScript型推論
- ✅ 同期/非同期の統一処理
- ✅ `Result.pipe`によるシンプルな合成
- ✅ オブジェクトベース（クラス継承なし）

### 短所
- ❌ 新しいライブラリ（neverthrow/fp-tsより小さいコミュニティ）
- ❌ エコシステムの統合が少ない

## APIハイライト

### コア関数
- `Result.succeed(value)` - 成功結果を作成
- `Result.fail(error)` - 失敗結果を作成
- `Result.isSuccess(result)` - 結果が成功かチェック
- `Result.isFailure(result)` - 結果が失敗かチェック

### 合成
- `Result.pipe()` - 複数の操作をチェイン
- `Result.andThen(fn)` - マップとチェイン（flatMapと同等）
- `Result.andThrough(fn)` - 実行するが結果を破棄（バリデーションに便利）
- `Result.map(fn)` - 成功値を変換

## 使用例

```typescript
const result = registerUser({ email: "test@example.com", name: "Test" });

if (Result.isSuccess(result)) {
  console.log("ユーザー登録成功:", result.value);
} else {
  console.error("エラー:", result.error);
}
```

## neverthrowとの比較

両ライブラリは似た機能を提供しますが、byethrowは以下を提供します：
- より小さなバンドルのためのツリーシェイク可能な設計
- クラスベースではなくオブジェクトベース
- より一貫したAPIネーミング
- より良い非同期/同期の統一

## テストの実行

```bash
pnpm test
```

## ビルド

```bash
pnpm build
```

## 詳細情報

- [byethrow GitHub](https://github.com/praha-inc/byethrow)
- [byethrow ドキュメント](https://praha-inc.github.io/byethrow/)
