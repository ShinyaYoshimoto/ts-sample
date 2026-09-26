/**
 * システム内の単一のログエントリーを表します。
 * @property level - ログの重大度レベル（INFO または ERROR）
 * @property message - ログメッセージの内容
 * @property timestamp - ログが作成された際のタイムスタンプ（オプショナル）
 */
export interface LogEntry {
	level: 'INFO' | 'ERROR';
	message: string;
	timestamp?: string;
}

/**
 * ログエントリーを1件ずつ処理するジェネレーター関数です。
 * すべてのデータを一度にメモリに読み込むのではなく、エントリーを個別にyieldすることで、
 * 大規模なログデータセットをメモリ効率的に処理します。
 *
 * @param logs - 処理対象のログエントリーの配列
 * @yields 入力配列から1件ずつログエントリーを返す
 * @returns LogEntryオブジェクトをyieldするジェネレーター
 *
 * @example
 * ```typescript
 * const logs: LogEntry[] = [
 *   { level: 'INFO', message: 'System started' },
 *   { level: 'ERROR', message: 'Connection failed' }
 * ];
 * for (const log of streamLogReader(logs)) {
 *   console.log(log.message);
 * }
 * ```
 */
export function* streamLogReader(
	logs: LogEntry[],
): Generator<LogEntry, void, unknown> {
	for (const log of logs) {
		yield log;
	}
}

/**
 * 指定されたレベルに基づいてログエントリーをフィルタリングする中間ジェネレーターです。
 * for...ofループを使用してソースジェネレーターを反復処理し、
 * 指定されたレベルに一致するログエントリーのみを条件付きでyieldします。
 *
 * @param source - フィルタリング対象のログエントリーを提供するジェネレーター
 * @param level - フィルタリングするログレベル（'INFO' または 'ERROR'）
 * @yields 指定されたレベルに一致するログエントリー
 * @returns フィルタリングされたLogEntryオブジェクトをyieldするジェネレーター
 *
 * @example
 * ```typescript
 * const logs: LogEntry[] = [
 *   { level: 'INFO', message: 'System started' },
 *   { level: 'ERROR', message: 'Connection failed' },
 *   { level: 'INFO', message: 'Request processed' }
 * ];
 * const pipeline = logFilter(streamLogReader(logs), 'ERROR');
 * for (const errorLog of pipeline) {
 *   console.log(errorLog.message); // 'Connection failed' のみ出力
 * }
 * ```
 */
export function* logFilter(
	source: Generator<LogEntry, void, unknown>,
	level: 'INFO' | 'ERROR',
): Generator<LogEntry, void, unknown> {
	for (const log of source) {
		if (log.level === level) {
			yield log;
		}
	}
}

/**
 * 非同期でログエントリーを1件ずつ処理する非同期ジェネレーター関数です。
 * ファイルI/O、データベースクエリ、APIリクエストなど、非同期データソースから
 * ログを読み込む際に使用します。各エントリーを個別にyieldすることで、
 * 大規模なログデータセットをメモリ効率的に処理します。
 *
 * @param logs - 処理対象のログエントリーの配列またはPromise
 * @param delayMs - 各エントリー間の遅延時間（ミリ秒）。デフォルトは0
 * @yields 入力配列から1件ずつログエントリーを非同期で返す
 * @returns LogEntryオブジェクトをyieldする非同期ジェネレーター
 *
 * @example
 * ```typescript
 * const logs: LogEntry[] = [
 *   { level: 'INFO', message: 'System started' },
 *   { level: 'ERROR', message: 'Connection failed' }
 * ];
 * for await (const log of asyncStreamLogReader(logs)) {
 *   console.log(log.message);
 * }
 * ```
 */
export async function* asyncStreamLogReader(
	logs: LogEntry[] | Promise<LogEntry[]>,
	delayMs = 0,
): AsyncGenerator<LogEntry, void, unknown> {
	const resolvedLogs = await Promise.resolve(logs);
	for (const log of resolvedLogs) {
		if (delayMs > 0) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
		yield log;
	}
}

/**
 * 指定されたレベルに基づいてログエントリーを非同期でフィルタリングする
 * 中間非同期ジェネレーターです。
 * for await...ofループを使用してソース非同期ジェネレーターを反復処理し、
 * 指定されたレベルに一致するログエントリーのみを条件付きでyieldします。
 *
 * @param source - フィルタリング対象のログエントリーを提供する非同期ジェネレーター
 * @param level - フィルタリングするログレベル（'INFO' または 'ERROR'）
 * @yields 指定されたレベルに一致するログエントリー
 * @returns フィルタリングされたLogEntryオブジェクトをyieldする非同期ジェネレーター
 *
 * @example
 * ```typescript
 * const logs: LogEntry[] = [
 *   { level: 'INFO', message: 'System started' },
 *   { level: 'ERROR', message: 'Connection failed' },
 *   { level: 'INFO', message: 'Request processed' }
 * ];
 * const pipeline = asyncLogFilter(asyncStreamLogReader(logs), 'ERROR');
 * for await (const errorLog of pipeline) {
 *   console.log(errorLog.message); // 'Connection failed' のみ出力
 * }
 * ```
 */
export async function* asyncLogFilter(
	source: AsyncGenerator<LogEntry, void, unknown>,
	level: 'INFO' | 'ERROR',
): AsyncGenerator<LogEntry, void, unknown> {
	for await (const log of source) {
		if (log.level === level) {
			yield log;
		}
	}
}
