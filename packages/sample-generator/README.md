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

### asyncStreamLogReader（非同期版）

非同期データソースから大量のログデータを1件ずつyieldする非同期Generator：

```typescript
async function* asyncStreamLogReader(
  logs: LogEntry[] | Promise<LogEntry[]>,
  delayMs?: number
): AsyncGenerator<LogEntry, void, unknown>
```

**特徴:**
- ファイルI/O、データベースクエリ、APIリクエストなどの非同期処理に対応
- Promise で包まれたデータソースを直接処理可能
- 遅延時間を設定して非同期I/Oをシミュレート可能

### asyncLogFilter（非同期版）

特定の条件に合致するログだけを非同期でフィルタリングする中間非同期Generator：

```typescript
async function* asyncLogFilter(
  source: AsyncGenerator<LogEntry, void, unknown>,
  level: 'INFO' | 'ERROR'
): AsyncGenerator<LogEntry, void, unknown>
```

**特徴:**
- `for await...of`を使用した非同期委譲処理
- 非同期パイプライン処理による柔軟な組み合わせ
- 非同期データストリームのフィルタリング

## 使用例

### 同期処理

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

### 非同期処理

```typescript
import { asyncStreamLogReader, asyncLogFilter } from '@ts-sample/sample-generator';

// 非同期でログを取得する関数
async function fetchLogs(): Promise<LogEntry[]> {
  // データベースやAPIからログを取得
  const response = await fetch('/api/logs');
  return await response.json();
}

// 非同期パイプライン処理
const logs = fetchLogs(); // Promise<LogEntry[]>
const pipeline = asyncLogFilter(asyncStreamLogReader(logs), 'ERROR');

// 1件ずつ非同期処理（メモリ効率的）
for await (const errorLog of pipeline) {
  console.log(`[${errorLog.timestamp}] ${errorLog.message}`);
  // 非同期処理（例：データベースへの保存）
  await saveToDatabase(errorLog);
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

### 非同期ストリームからの読み込み（実装済み）

`asyncStreamLogReader` と `asyncLogFilter` を使用して、非同期データソースから効率的にデータを処理できます：

```typescript
// AsyncIterableからの読み込み
async function* readFromAsyncSource(
  source: AsyncIterable<LogEntry>
): AsyncGenerator<LogEntry, void, unknown> {
  for await (const log of source) {
    yield log;
  }
}

// 使用例
const asyncSource = readFromDatabase(); // AsyncIterable<LogEntry>
for await (const log of readFromAsyncSource(asyncSource)) {
  console.log(log);
}
```

### 複数のフィルタの組み合わせ

```typescript
// 同期版
function* messageFilter(
  source: Generator<LogEntry, void, unknown>,
  keyword: string
): Generator<LogEntry, void, unknown> {
  for (const log of source) {
    if (log.message.includes(keyword)) {
      yield log;
    }
  }
}

const pipeline = messageFilter(
  logFilter(streamLogReader(logs), 'ERROR'),
  'timeout'
);

// 非同期版
async function* asyncMessageFilter(
  source: AsyncGenerator<LogEntry, void, unknown>,
  keyword: string
): AsyncGenerator<LogEntry, void, unknown> {
  for await (const log of source) {
    if (log.message.includes(keyword)) {
      yield log;
    }
  }
}

const asyncPipeline = asyncMessageFilter(
  asyncLogFilter(asyncStreamLogReader(logs), 'ERROR'),
  'timeout'
);
```

### データ変換

```typescript
// 同期版
function* logTransform(
  source: Generator<LogEntry, void, unknown>
): Generator<string, void, unknown> {
  for (const log of source) {
    yield `[${log.level}] ${log.message}`;
  }
}

// 非同期版
async function* asyncLogTransform(
  source: AsyncGenerator<LogEntry, void, unknown>
): AsyncGenerator<string, void, unknown> {
  for await (const log of source) {
    yield `[${log.level}] ${log.message}`;
  }
}
```

## ライセンス

ISC
