/**
 * sample-generator パッケージ
 *
 * このパッケージは、JavaScriptのジェネレーターを使用した
 * メモリ効率の良いログ処理を提供します。
 * すべてのデータをメモリに読み込むことなく、大規模なデータセットを
 * 処理する方法を示しています。
 *
 * @packageDocumentation
 */

export {
	type LogEntry,
	streamLogReader,
	logFilter,
	asyncStreamLogReader,
	asyncLogFilter,
} from './src/logProcessor';
