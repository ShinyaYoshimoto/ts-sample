# sample-fp-ts

このパッケージは、TypeScript向けの標準的な関数型プログラミングライブラリ **fp-ts** を使用したエラーハンドリングを実装したものです。

## 概要

fp-tsは、ScalaとHaskellに触発されたTypeScript向けの包括的な関数型プログラミングライブラリです。以下を提供します：
- 同期エラーハンドリングのための`Either<E, A>`型
- 非同期エラーハンドリングのための`TaskEither<E, A>`型
- 広範な関数型プログラミングユーティリティ
- パイプベースの合成
- 実戦でテストされ広く採用されている

## 実装の特徴

### 1. TaskEither型
関数は非同期操作に対して`TaskEither<Error, Success>`を返します：
```typescript
function validateInput(input: CreateUserInput): TE.TaskEither<ValidationError, CreateUserInput>
```

### 2. パイプベースの合成
fp-tsは合成に`pipe`関数を使用します：
```typescript
return pipe(
  validateInput(input),
  TE.chainW((validatedInput) => ...),
  TE.chainW((validatedInput) => ...)
)
```

### 3. Do記法（代替実装）
fp-tsは命令型スタイルの合成のために「do記法」もサポートしています：
```typescript
return pipe(
  TE.Do,
  TE.bind('validatedInput', () => validateInput(input)),
  TE.bind('_checkExists', ({ validatedInput }) => checkUserExists(...)),
  ...
)
```

## 主な特徴

### 長所
- ✅ 成熟し実戦でテスト済み
- ✅ 包括的な関数型プログラミングツールキット
- ✅ 強力な型推論
- ✅ 大規模なコミュニティとエコシステム
- ✅ モジュラー設計（ツリーシェイク可能）
- ✅ よく文書化されている

### 短所
- ❌ FP初心者には急な学習曲線
- ❌ よりシンプルな代替手段より冗長
- ❌ FPの概念（Monad、Functorなど）の理解が必要
- ❌ 多くの抽象化により圧倒される可能性

## 使用例

```typescript
const taskEither = registerUser({ email: "test@example.com", name: "Test" });

// 実行して結果を処理
const result = await runTaskEither(taskEither);

if (E.isRight(result)) {
  console.log("ユーザー登録成功:", result.right);
} else {
  console.error("エラー:", result.left);
}

// パターンマッチングにfoldを使用
const message = E.fold(
  (error) => `エラー: ${error.message}`,
  (user) => `成功: ${user.email}`
)(result);
```

## テストの実行

```bash
pnpm test
```

## ビルド

```bash
pnpm build
```

## 詳細情報

- [fp-ts ドキュメント](https://gcanti.github.io/fp-ts/)
- [fp-ts 学習リソース](https://github.com/gcanti/fp-ts/blob/master/docs/learning-resources.md)
