# sample-un-result

このパッケージは、Result型ライブラリを使用せずに **純粋なTypeScript** でエラーハンドリングを実装したものです。Result型を使用する利点とトレードオフを理解するためのベースライン比較として機能します。

## 概要

この実装では、TypeScriptの伝統的なエラーハンドリング手法を使用しています：
- **try-catchブロック** による例外処理
- **エラーのthrow** による失敗ケースの処理
- **ユニオン型** による成功/エラーレスポンス
- **null/undefined** の返却（比較のためのアンチパターン）

## 実装の特徴

### 1. 伝統的なthrowベースのエラー
```typescript
export function validateInput(input: CreateUserInput): CreateUserInput {
  if (!input.email || input.email.trim() === '') {
    throw { _tag: 'ValidationError', message: 'Email is required' } as ValidationError;
  }
  return input;
}
```

### 2. Try-Catchエラーハンドリング
```typescript
export function registerUser(input: CreateUserInput): 
  { success: true; data: User } | { success: false; error: AppError } {
  try {
    const validatedInput = validateInput(input);
    checkUserExists(validatedInput.email);
    const user = saveUser(createUser(validatedInput));
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as AppError };
  }
}
```

### 3. Nullパターン（アンチパターン）
```typescript
export function registerUserNullable(input: CreateUserInput): User | null {
  try {
    // ... 処理
    return user;
  } catch {
    return null; // すべてのエラー情報を失う！
  }
}
```

## 特徴

### 長所
- ✅ JavaScript/TypeScriptにネイティブ
- ✅ 追加の依存関係なし
- ✅ ほとんどの開発者に馴染みがある
- ✅ 既存のエコシステムと連携

### 短所
- ❌ エラーが型シグネチャで追跡されない
- ❌ エラーハンドリングを忘れやすい
- ❌ try-catchブロックが冗長
- ❌ どこからでもエラーがthrowされる可能性
- ❌ 型の絞り込みに手動チェックが必要
- ❌ Nullパターンはエラー情報を失う
- ❌ スタックトレースが誤解を招く可能性
- ❌ 操作の安全な合成が困難

## よくある問題

### 1. コンパイル時のエラー追跡なし
```typescript
// 関数シグネチャはthrowする可能性を示さない
function validateInput(input: CreateUserInput): CreateUserInput {
  throw new Error(); // サプライズ！
}

// 呼び出し側はエラー処理が必要だと知る術がない
const result = validateInput(input); // クラッシュするかも！
```

### 2. エラーハンドリングを忘れやすい
```typescript
// これはコンパイルできるが、バリデーション失敗時にクラッシュする
const validated = validateInput(input);
const user = saveUser(createUser(validated));
// エラー処理のリマインダーなし！
```

### 3. 型安全性の問題
```typescript
try {
  // ...
} catch (error) {
  // errorは'unknown'または'any'型
  // 手動の型ガードが必要
  if (error && typeof error === 'object' && '_tag' in error) {
    // これで使える
  }
}
```

### 4. Nullパターンはコンテキストを失う
```typescript
const user = registerUserNullable(input);
if (user === null) {
  // なぜ失敗した？バリデーション？競合？インフラ？
  // 知る方法がない！
}
```

### 5. 合成が困難
```typescript
// 操作を簡単にチェインできない
try {
  const a = operationA();
  try {
    const b = operationB(a);
    try {
      const c = operationC(b);
      return c;
    } catch (errorC) {
      // Cのエラーを処理
    }
  } catch (errorB) {
    // Bのエラーを処理
  }
} catch (errorA) {
  // Aのエラーを処理
}
```

## Result型との比較

| 側面 | 純粋なTypeScript | Result型 |
|--------|----------------|--------------|
| エラー追跡 | ❌ 実行時のみ | ✅ コンパイル時 |
| 型安全性 | ⚠️ ガードが必要 | ✅ 自動 |
| 合成 | ❌ 冗長 | ✅ クリーン |
| 明示性 | ❌ 隠れたthrow | ✅ 明示的 |
| 学習コスト | ✅ 低い | ⚠️ 中程度 |
| ボイラープレート | ⚠️ try-catchブロック | ✅ 最小限 |

## 使用例

### 基本的な使用
```typescript
const result = registerUser({ email: "test@example.com", name: "Test" });

if (result.success) {
  console.log("ユーザー登録成功:", result.data);
} else {
  console.error("エラー:", result.error);
}
```

### 非同期での使用
```typescript
const result = await registerUserAsync({ email: "test@example.com", name: "Test" });

if (result.success) {
  console.log("ユーザー登録成功:", result.data);
} else {
  console.error("エラー:", result.error);
}
```

### Nullパターン（非推奨）
```typescript
const user = registerUserNullable({ email: "test@example.com", name: "Test" });

if (user === null) {
  console.error("ユーザー登録失敗"); // しかしなぜ？
} else {
  console.log("ユーザー登録成功:", user);
}
```

## なぜResult型を使うべきか？

このベースライン実装を通じて、Result型ライブラリの利点が明確になります：

1. **型安全性**: エラーが型システムで追跡される
2. **明示性**: 関数シグネチャが失敗する可能性を示す
3. **合成**: 失敗する可能性のある操作を簡単にチェインできる
4. **サプライズなし**: エラー処理を忘れることができない
5. **優れたDX**: エラーハンドリングのIDE補完サポート
6. **関数型**: 副作用のない純粋な関数

より良いエラーハンドリング手法については、他のパッケージ（`sample-byethrow`、`sample-neverthrow`、`sample-effect-ts`、`sample-fp-ts`）を参照してください。

## テストの実行

```bash
pnpm test
```

## ビルド

```bash
pnpm build
```
