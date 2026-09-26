# result-type

Result型によるエラーハンドリングを、同じユースケース（ユーザー登録）で実装して比較するパッケージです。
ピュアなTypeScript（ベースライン）と4つのResult型ライブラリの実装を1つのパッケージにまとめています。

Result型を通信（API）の境界をまたいで受け渡す方法（tRPC / GraphQL / Connect）は [`../result-transport`](../result-transport) を参照してください。

## 構成

```
packages/result-type/
├── README.md               # このファイル（比較結果）
└── src/
    ├── contract.test.ts    # 全実装に共通の仕様テスト
    ├── un-result/          # 0. Pure TypeScript（ベースライン）
    ├── byethrow/           # 1. @praha/byethrow
    ├── neverthrow/         # 2. neverthrow
    ├── effect-ts/          # 3. Effect
    └── fp-ts/              # 4. fp-ts
```

各ディレクトリに `index.ts`（実装）、`index.test.ts`（そのライブラリ固有の API の使い方を示すテスト）、`README.md`（ライブラリの解説）があります。

### 共通仕様テスト（`src/contract.test.ts`）

実装ごとに戻り値の型（例外 / `Result` / `TaskEither` / `Effect`）は異なりますが、
アダプタで共通の形に揃え、**同じ入力に対して全実装が同じ結果（エラーの種類とメッセージまで）を返すこと**を検証しています。
各実装の派生版（`registerUserAsync` / `registerUserFunctional` / `registerUserDo`）も対象です。
入力と結果の対応はこのテストだけで検証し、各実装の `index.test.ts` で重複して書かないようにしています。
新しいライブラリを比較対象に追加するときは、`src/<ライブラリ名>/` を作り、`contract.test.ts` にアダプタを1つ足してください。

| 入力 | 期待する結果 |
|---|---|
| 正しいメールアドレスと名前 | 登録成功 |
| メールアドレスが空 / 形式不正、名前が空 | `ValidationError` |
| `test@example.com`（登録済み） | `ConflictError` |
| `fail` を含むメールアドレス（保存失敗） | `InfrastructureError` |

## 実行方法

```bash
cd packages/result-type
pnpm test            # 5実装の個別テスト + 共通仕様テスト
pnpm test contract   # 共通仕様テストのみ
pnpm test neverthrow # 特定の実装のテストのみ
```

## 対象実装

0. **Pure TypeScript** (`src/un-result/`) - **ベースライン**
1. **byethrow** (`src/byethrow/`)
2. **neverthrow** (`src/neverthrow/`)
3. **effect-ts** (`src/effect-ts/`)
4. **fp-ts** (`src/fp-ts/`)

## 実装内容

各実装で同じユーザー登録ロジックを実装しました：

- **バリデーション**: メールアドレスと名前の検証
- **重複チェック**: 既存ユーザーの確認
- **データ保存**: ユーザー情報のDB保存（モック）

## 比較結果

### 0. Pure TypeScript (ベースライン)

**特徴**:
- ネイティブのtry-catch構文
- 例外をthrowするエラーハンドリング
- 追加の依存関係なし
- 慣れ親しんだパターン

**型推論**:
- ❌ エラーが型シグネチャに現れない
- ❌ catchブロックでの型安全性がない
- ❌ エラー処理の忘れやすさ

**非同期処理**:
- ✅ async/awaitで動作
- ❌ エラーハンドリングが冗長
- ❌ 合成が困難

**可読性**:
```typescript
try {
  const validated = validateInput(input);
  checkUserExists(validated.email);
  return { success: true, data: saveUser(createUser(validated)) };
} catch (error) {
  return { success: false, error: error as AppError };
}
```

**ボイラープレート**:
- ⚠️ try-catchブロックが冗長
- ❌ 型ガードが必要
- ❌ エラーハンドリングが散在

**学習コスト**: ⭐ (最低)

**問題点**:
- エラーが型システムで追跡されない
- エラーハンドリングを忘れがち
- 合成が困難で冗長
- null返却パターンはエラー情報を失う

---

### 1. byethrow

**特徴**:
- 軽量（~3KB）かつツリーシェイク可能
- オブジェクトベース（クラス不要）
- 一貫したAPI設計
- 同期/非同期の統一処理
- `Result.pipe` による読みやすい合成

**型推論**:
- ✅ 優秀な型推論
- ✅ エラー型の自動追跡
- ✅ TypeScriptとの相性が良い

**非同期処理**:
- ✅ Promise自動処理
- ✅ 同期/非同期の統一API
- ✅ シンプルな async/await 統合

**可読性**:
```typescript
return Result.pipe(
  validateInput(input),
  Result.andThrough((validated) => checkUserExists(validated.email)),
  Result.andThen((validated) => saveUser(createUser(validated)))
);
```

**ボイラープレート**:
- ✅ 最小限のボイラープレート
- ✅ シンプルで一貫したAPI
- ✅ ツリーシェイク可能

**学習コスト**: ⭐⭐ (低)

---

### 2. neverthrow

**特徴**:
- 軽量（~5KB）でシンプルなAPI
- `Result<T, E>` と `ResultAsync<T, E>` を提供
- Rustの Result型に触発された設計
- async/awaitとの親和性が高い

**型推論**:
- ✅ 優秀な型推論
- ✅ エラー型の自動追跡
- ⚠️ 場合によっては手動での型のwideningが必要

**非同期処理**:
- ✅ async/awaitと自然に統合
- ✅ `ResultAsync`で関数型スタイルも可能
- ✅ 学習コストが低い

**可読性**:
```typescript
const result = await validateInput(input);
if (result.isErr()) {
  return err(result.error);
}
```

**ボイラープレート**:
- ✅ 最小限のボイラープレート
- ✅ シンプルなAPI

**学習コスト**: ⭐⭐ (低)

---

### 3. effect-ts

**特徴**:
- 高機能で包括的なエコシステム
- `Effect<Success, Error, Requirements>` 型
- 依存性注入、リトライ、タイムアウトなど豊富な機能
- アクティブな開発コミュニティ

**型推論**:
- ✅ 非常に優れた型推論
- ✅ エラー型が自動的に追跡される
- ✅ タグ付きエラーでパターンマッチングが簡単

**非同期処理**:
- ✅ 強力な非同期処理サポート
- ✅ `Effect.runPromise`で実行
- ⚠️ Effectの概念理解が必要

**可読性**:
```typescript
return pipe(
  validateInput(input),
  Effect.flatMap((validatedInput) => ...),
  Effect.flatMap((validatedInput) => ...)
)
```

**ボイラープレート**:
- ⚠️ シンプルなケースではやや冗長
- ✅ 複雑なケースでは強力

**学習コスト**: ⭐⭐⭐⭐ (高)

---

### 4. fp-ts

**特徴**:
- TypeScriptの標準的な関数型プログラミングライブラリ
- `Either<E, A>` と `TaskEither<E, A>` を提供
- ScalaやHaskellに触発された設計
- 成熟したエコシステム

**型推論**:
- ✅ 強力な型推論
- ✅ `chainW` (widen) でエラー型の拡張が可能
- ⚠️ 複雑な型署名になりがち

**非同期処理**:
- ✅ `TaskEither`で非同期処理をサポート
- ✅ pipeベースの合成
- ⚠️ 関数型プログラミングの知識が必要

**可読性**:
```typescript
return pipe(
  validateInput(input),
  TE.chainW((validatedInput) => ...),
  TE.chainW((validatedInput) => ...)
)
```

**ボイラープレート**:
- ⚠️ モジュールのインポートが多い
- ⚠️ pipe関数の使用が必須

**学習コスト**: ⭐⭐⭐⭐ (高)

---

## 推奨用途

### Pure TypeScriptを使う場合（非推奨）
- 依存関係を絶対に追加したくない
- 既存コードベースが既にtry-catchパターン
- **注意**: エラー追跡とtype safetyの欠如に注意

### byethrowが適している場合
- 軽量でツリーシェイク可能なライブラリが必要
- モダンなAPIデザインを好む
- 同期/非同期の統一的な処理が必要
- バンドルサイズを最小限に抑えたい
- シンプルかつ強力な合成が必要

### neverthrowが適している場合
- シンプルなエラーハンドリングが必要
- 学習コストを抑えたい
- 既存のasync/awaitコードに統合したい
- 実績のあるライブラリを使いたい

### effect-tsが適している場合
- 複雑なビジネスロジックを扱う
- リトライ、タイムアウト、並行処理などが必要
- 依存性注入パターンを使いたい
- 最新の関数型プログラミング手法を採用したい

### fp-tsが適している場合
- 関数型プログラミングの経験がある
- 既にfp-tsを使用しているプロジェクト
- 型安全性を最優先したい
- ScalaやHaskellの経験がある

## パフォーマンス比較

| ライブラリ | バンドルサイズ | 実行速度 |
|----------|--------------|---------|
| Pure TypeScript | 0KB | ⭐⭐⭐⭐⭐ |
| byethrow | ~3KB | ⭐⭐⭐⭐⭐ |
| neverthrow | ~5KB | ⭐⭐⭐⭐⭐ |
| effect-ts | ~100KB+ | ⭐⭐⭐ |
| fp-ts | ~50KB | ⭐⭐⭐⭐ |

## まとめ

**ベースライン**: Pure TypeScript - ネイティブだが型安全性に欠ける

**初心者向け**: byethrow / neverthrow - シンプルで学習しやすい

**中級者向け**: fp-ts - 関数型プログラミングの標準

**上級者向け**: effect-ts - 高機能で最新の手法

