/**
 * LogEntry represents a single log entry in the system.
 * @property level - The severity level of the log (INFO or ERROR)
 * @property message - The log message content
 * @property timestamp - Optional timestamp for when the log was created
 */
export interface LogEntry {
	level: 'INFO' | 'ERROR';
	message: string;
	timestamp?: string;
}

/**
 * streamLogReader is a generator function that processes log entries one at a time.
 * This provides memory-efficient processing of large log datasets by yielding
 * entries individually instead of loading all data into memory at once.
 *
 * @param logs - Array of log entries to be processed
 * @yields Individual log entries from the input array
 * @returns Generator that yields LogEntry objects
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
 * logFilter is an intermediate generator that filters log entries based on a specified level.
 * It uses a for...of loop to iterate through the source generator and conditionally yields
 * only the log entries that match the specified level.
 *
 * @param source - Generator that provides log entries to be filtered
 * @param level - The log level to filter for ('INFO' or 'ERROR')
 * @yields Log entries that match the specified level
 * @returns Generator that yields filtered LogEntry objects
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
 *   console.log(errorLog.message); // Only 'Connection failed'
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
