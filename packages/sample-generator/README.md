# @ts-sample/sample-generator

JavaScriptのGeneratorを使用した、メモリ効率の良い大規模データ処理のサンプル実装です。

## 概要

このパッケージは、巨大なログデータやマスタデータを処理する際に、全データをメモリに読み込むことなく、ストリーミング処理を実現するためのGeneratorパターンを実装しています。

## 主な機能

### LogEntry型

ログエントリーを表す型定義：

```typescript
interface LogEntry {
  level: 'INFO' | 'ERROR';
  message: string;
  timestamp?: string;
}
```

### streamLogReader

大量のログデータを1件ずつyieldするSource Generator：

```typescript
function* streamLogReader(logs: LogEntry[]): Generator<LogEntry, void, unknown>
```

**特徴:**
- 配列全体をメモリに保持せず、1件ずつ処理
- 遅延評価により、必要な分だけデータを処理
- AsyncGeneratorへの拡張が容易

### logFilter

特定の条件に合致するログだけをフィルタリングするIntermediate Generator：

```typescript
function* logFilter(
  source: Generator<LogEntry, void, unknown>,
  level: 'INFO' | 'ERROR'
): Generator<LogEntry, void, unknown>
```

**特徴:**
- `for...of`を使用した委譲処理
- パイプライン処理による柔軟な組み合わせ
- 条件に合致しないデータはスキップ

## 使用例

```typescript
import { LogEntry, streamLogReader, logFilter } from '@ts-sample/sample-generator';

// 大量のログデータ
const logs: LogEntry[] = [
  { level: 'INFO', message: 'System started', timestamp: '2024-01-01T00:00:00Z' },
  { level: 'ERROR', message: 'Connection failed', timestamp: '2024-01-01T00:01:00Z' },
  { level: 'INFO', message: 'Retrying...', timestamp: '2024-01-01T00:02:00Z' },
  { level: 'ERROR', message: 'Timeout error', timestamp: '2024-01-01T00:03:00Z' },
  // ... 10万件以上のデータ
];

// パイプライン処理：エラーログだけを抽出
const pipeline = logFilter(streamLogReader(logs), 'ERROR');

// 1件ずつ処理（メモリ効率的）
for (const errorLog of pipeline) {
  console.log(`[${errorLog.timestamp}] ${errorLog.message}`);
}
```

## メモリ効率性

### 従来の配列処理

```typescript
// 全データをメモリに読み込む
const allLogs = loadAllLogs(); // 10万件
const errorLogs = allLogs.filter(log => log.level === 'ERROR'); // 別の配列を生成
```

**問題点:**
- 元のデータ（10万件）とフィルタ後のデータ（例：5万件）の両方がメモリに存在
- 大規模データでNode.jsのメモリ制限に達する可能性

### Generator処理

```typescript
// データを1件ずつ処理
const pipeline = logFilter(streamLogReader(allLogs), 'ERROR');
for (const log of pipeline) {
  processLog(log); // 1件処理したら次へ
}
```

**利点:**
- 同時にメモリに存在するのは処理中の1件のみ
- 10万件でも100万件でも、メモリ使用量はほぼ一定
- 早期終了が可能（途中でbreakできる）

## テスト

```bash
# テストの実行
pnpm test

# ビルド
pnpm build
```

## 拡張性

このパターンは以下のような拡張が可能です：

### AsyncGeneratorへの対応

```typescript
async function* asyncStreamLogReader(
  logSource: AsyncIterable<LogEntry>
): AsyncGenerator<LogEntry, void, unknown> {
  for await (const log of logSource) {
    yield log;
  }
}
```

### 複数のフィルタの組み合わせ

```typescript
const pipeline = logFilter(
  logFilter(streamLogReader(logs), 'ERROR'),
  (log) => log.message.includes('timeout')
);
```

### データ変換

```typescript
function* logTransform(
  source: Generator<LogEntry, void, unknown>
): Generator<string, void, unknown> {
  for (const log of source) {
    yield `[${log.level}] ${log.message}`;
  }
}
```

## ライセンス

ISC
