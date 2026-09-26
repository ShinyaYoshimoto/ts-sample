# 概要

- Zodの使い方を検証するディレクトリ
- 2025年にZodの最新メジャーバージョンv4がリリース
- v3との比較や新機能、zodの使い方などを試す

## Zodとは

```
Zod is a TypeScript-first validation library. Using Zod, you can define schemas you can use to validate data, from a simple string to a complex nested object.
```

↓和訳
```
Zodは、TypeScriptでの利用を最優先に考えた検証ライブラリです。Zodを使用すると、単純な文字列から複雑なネストされたオブジェクトに至るまで、データを検証するためのスキーマを定義できます。
```

## v4

- 要望の高かった機能の実装
- パフォーマンスの大幅な向上

### パフォーマンスの大幅な向上

- 文字列パースが14倍高速 cf. `z.string().parse`
- 配列パースが7倍高速 cf. `z.array().parse`
- オブジェクトパースが6.5倍高速 cf. `z.object().parse`
- tscによるコンパイル時に生成されるインスタンスが1/100
- コアバンドルサイズが1/2（zod/v4-miniはさらに小さい。zod3から85%減）