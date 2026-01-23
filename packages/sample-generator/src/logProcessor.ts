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
