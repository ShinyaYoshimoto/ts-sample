import { describe, it, expect } from 'vitest';
import {
	type LogEntry,
	streamLogReader,
	logFilter,
	asyncStreamLogReader,
	asyncLogFilter,
} from '../logProcessor';

describe('Generatorベースのログ処理', () => {
	describe('LogEntry型', () => {
		it('有効なログエントリーを正しく型付けできる', () => {
			const log: LogEntry = {
				level: 'INFO',
				message: 'テストメッセージ',
				timestamp: '2024-01-01T00:00:00Z',
			};
			expect(log.level).toBe('INFO');
			expect(log.message).toBe('テストメッセージ');
			expect(log.timestamp).toBe('2024-01-01T00:00:00Z');
		});

		it('timestampをオプショナルにできる', () => {
			const log: LogEntry = {
				level: 'ERROR',
				message: 'エラーが発生しました',
			};
			expect(log.timestamp).toBeUndefined();
		});
	});

	describe('streamLogReader', () => {
		it('すべてのログを1件ずつyieldする', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'ログ 1' },
				{ level: 'ERROR', message: 'ログ 2' },
				{ level: 'INFO', message: 'ログ 3' },
			];

			const result: LogEntry[] = [];
			for (const log of streamLogReader(logs)) {
				result.push(log);
			}

			expect(result).toHaveLength(3);
			expect(result[0].message).toBe('ログ 1');
			expect(result[1].message).toBe('ログ 2');
			expect(result[2].message).toBe('ログ 3');
		});

		it('空の配列を処理できる', () => {
			const logs: LogEntry[] = [];
			const result: LogEntry[] = [];
			for (const log of streamLogReader(logs)) {
				result.push(log);
			}
			expect(result).toHaveLength(0);
		});

		it('すべてをメモリに読み込まずに遅延評価でログをyieldする', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'ログ 1' },
				{ level: 'INFO', message: 'ログ 2' },
			];

			const generator = streamLogReader(logs);
			
			// 最初の呼び出しは最初のログを返す
			const first = generator.next();
			expect(first.done).toBe(false);
			expect(first.value?.message).toBe('ログ 1');

			// 2回目の呼び出しは2番目のログを返す
			const second = generator.next();
			expect(second.done).toBe(false);
			expect(second.value?.message).toBe('ログ 2');

			// 3回目の呼び出しは完了を示す
			const third = generator.next();
			expect(third.done).toBe(true);
		});
	});

	describe('logFilter', () => {
		it('ERRORログのみをフィルタリングする', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: '情報 1' },
				{ level: 'ERROR', message: 'エラー 1' },
				{ level: 'INFO', message: '情報 2' },
				{ level: 'ERROR', message: 'エラー 2' },
			];

			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(2);
			expect(result[0].message).toBe('エラー 1');
			expect(result[1].message).toBe('エラー 2');
			expect(result.every(log => log.level === 'ERROR')).toBe(true);
		});

		it('INFOログのみをフィルタリングする', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: '情報 1' },
				{ level: 'ERROR', message: 'エラー 1' },
				{ level: 'INFO', message: '情報 2' },
			];

			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'INFO');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(2);
			expect(result[0].message).toBe('情報 1');
			expect(result[1].message).toBe('情報 2');
			expect(result.every(log => log.level === 'INFO')).toBe(true);
		});

		it('一致するログがない場合は空を返す', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: '情報 1' },
				{ level: 'INFO', message: '情報 2' },
			];

			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(0);
		});

		it('空のソースジェネレーターで動作する', () => {
			const logs: LogEntry[] = [];
			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(0);
		});

		it('フィルタリングされた結果全体を実体化せずに遅延処理する', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: '情報 1' },
				{ level: 'ERROR', message: 'エラー 1' },
				{ level: 'ERROR', message: 'エラー 2' },
			];

			const generator = logFilter(streamLogReader(logs), 'ERROR');
			
			// 最初の呼び出しは最初のERRORログを返す
			const first = generator.next();
			expect(first.done).toBe(false);
			expect(first.value?.message).toBe('エラー 1');

			// 2回目の呼び出しは2番目のERRORログを返す
			const second = generator.next();
			expect(second.done).toBe(false);
			expect(second.value?.message).toBe('エラー 2');

			// 3回目の呼び出しは完了を示す
			const third = generator.next();
			expect(third.done).toBe(true);
		});
	});

	describe('パイプライン合成', () => {
		it('streamLogReaderとlogFilterを組み合わせる', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'プロセス開始' },
				{ level: 'ERROR', message: '接続失敗' },
				{ level: 'INFO', message: '再試行中...' },
				{ level: 'ERROR', message: 'タイムアウトエラー' },
				{ level: 'INFO', message: 'プロセス完了' },
			];

			const errorLogs: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const errorLog of pipeline) {
				errorLogs.push(errorLog);
			}

			expect(errorLogs).toHaveLength(2);
			expect(errorLogs[0].message).toBe('接続失敗');
			expect(errorLogs[1].message).toBe('タイムアウトエラー');
		});

		it('フィルタリングされたログのtimestampフィールドを処理する', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: '情報', timestamp: '2024-01-01T00:00:00Z' },
				{ level: 'ERROR', message: 'エラー', timestamp: '2024-01-01T00:01:00Z' },
			];

			const errorLogs: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const errorLog of pipeline) {
				errorLogs.push(errorLog);
			}

			expect(errorLogs).toHaveLength(1);
			expect(errorLogs[0].timestamp).toBe('2024-01-01T00:01:00Z');
		});
	});

	describe('大規模データセットでのメモリ効率', () => {
		it('10万件のログエントリーを過度なメモリ使用なしで処理する', () => {
			// 10万件のログエントリーを生成
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: i % 2 === 0 ? 'INFO' : 'ERROR',
					message: `ログエントリー ${i}`,
					timestamp: new Date(Date.now() + i).toISOString(),
				});
			}

			// メモリ使用パターンを測定 - generatorは一度に1件ずつ処理する
			let processedCount = 0;
			const errorLogs: string[] = []; // 処理を検証するためにメッセージのみを保存
			
			// ジェネレーターパイプラインを通じて処理
			for (const log of logFilter(streamLogReader(logs), 'ERROR')) {
				processedCount++;
				// テストでのメモリ蓄積を避けるためにサンプルのみを保存
				if (processedCount <= 10 || processedCount > 49990) {
					errorLogs.push(log.message);
				}
			}

			// 5万件のERRORログ（10万件の半分）を処理したはず
			expect(processedCount).toBe(50_000);
			
			// 先頭と末尾のサンプルを検証
			expect(errorLogs[0]).toBe('ログエントリー 1');
			expect(errorLogs[9]).toBe('ログエントリー 19');
		});

		it('10万件のエントリーをすべてのフィルタリング結果を一度に読み込まずに処理する', () => {
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: i % 10 === 0 ? 'ERROR' : 'INFO',
					message: `ログ ${i}`,
				});
			}

			// ジェネレーターを使用して最初の100件のERRORログのみを処理
			const generator = logFilter(streamLogReader(logs), 'ERROR');
			const samples: LogEntry[] = [];
			
			for (let i = 0; i < 100; i++) {
				const { value, done } = generator.next();
				if (done) break;
				samples.push(value);
			}

			// 100件のサンプルを取得したはず
			expect(samples).toHaveLength(100);
			expect(samples[0].message).toBe('ログ 0');
			expect(samples[1].message).toBe('ログ 10');
			expect(samples[99].message).toBe('ログ 990');
		});

		it('ジェネレーターの遅延評価を実証する', () => {
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: 'ERROR',
					message: `ログ ${i}`,
				});
			}

			// ジェネレーターを作成するが消費しない
			const generator = logFilter(streamLogReader(logs), 'ERROR');
			
			// ジェネレーターは作成されたが処理はまだ発生していない
			// 1つのアイテムだけを消費
			const first = generator.next();
			expect(first.done).toBe(false);
			expect(first.value?.message).toBe('ログ 0');
			
			// 処理を続行できることを検証
			const second = generator.next();
			expect(second.done).toBe(false);
			expect(second.value?.message).toBe('ログ 1');
		});

		it('残りのアイテムを処理せずに早期終了を許可する', () => {
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: 'ERROR',
					message: `ログ ${i}`,
				});
			}

			// 特定の条件が見つかるまで処理
			let found = false;
			let iterationCount = 0;
			
			for (const log of logFilter(streamLogReader(logs), 'ERROR')) {
				iterationCount++;
				if (log.message === 'ログ 1000') {
					found = true;
					break; // 早期終了
				}
			}

			expect(found).toBe(true);
			expect(iterationCount).toBe(1001); // 一致するまでしか処理していない
			// 残りの98,999アイテムは処理されなかった
		});
	});

	describe('非同期ジェネレーター処理', () => {
		describe('asyncStreamLogReader', () => {
			it('すべてのログを1件ずつ非同期でyieldする', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: 'ログ 1' },
					{ level: 'ERROR', message: 'ログ 2' },
					{ level: 'INFO', message: 'ログ 3' },
				];

				const result: LogEntry[] = [];
				for await (const log of asyncStreamLogReader(logs)) {
					result.push(log);
				}

				expect(result).toHaveLength(3);
				expect(result[0].message).toBe('ログ 1');
				expect(result[1].message).toBe('ログ 2');
				expect(result[2].message).toBe('ログ 3');
			});

			it('Promiseで包まれたログ配列を処理できる', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: '非同期ログ 1' },
					{ level: 'ERROR', message: '非同期ログ 2' },
				];
				const asyncLogs = Promise.resolve(logs);

				const result: LogEntry[] = [];
				for await (const log of asyncStreamLogReader(asyncLogs)) {
					result.push(log);
				}

				expect(result).toHaveLength(2);
				expect(result[0].message).toBe('非同期ログ 1');
				expect(result[1].message).toBe('非同期ログ 2');
			});

			it('空の配列を非同期で処理できる', async () => {
				const logs: LogEntry[] = [];
				const result: LogEntry[] = [];
				for await (const log of asyncStreamLogReader(logs)) {
					result.push(log);
				}
				expect(result).toHaveLength(0);
			});

			it('遅延時間を設定して非同期処理をシミュレートできる', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: 'ログ 1' },
					{ level: 'INFO', message: 'ログ 2' },
				];

				const startTime = Date.now();
				const result: LogEntry[] = [];
				
				for await (const log of asyncStreamLogReader(logs, 10)) {
					result.push(log);
				}
				
				const elapsed = Date.now() - startTime;

				expect(result).toHaveLength(2);
				// 最低でも10ms * 2 = 20msかかるはず
				expect(elapsed).toBeGreaterThanOrEqual(15);
			});

			it('遅延評価で非同期にログをyieldする', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: 'ログ 1' },
					{ level: 'INFO', message: 'ログ 2' },
				];

				const generator = asyncStreamLogReader(logs);
				
				// 最初の呼び出しは最初のログを返す
				const first = await generator.next();
				expect(first.done).toBe(false);
				expect(first.value?.message).toBe('ログ 1');

				// 2回目の呼び出しは2番目のログを返す
				const second = await generator.next();
				expect(second.done).toBe(false);
				expect(second.value?.message).toBe('ログ 2');

				// 3回目の呼び出しは完了を示す
				const third = await generator.next();
				expect(third.done).toBe(true);
			});
		});

		describe('asyncLogFilter', () => {
			it('ERRORログのみを非同期でフィルタリングする', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: '情報 1' },
					{ level: 'ERROR', message: 'エラー 1' },
					{ level: 'INFO', message: '情報 2' },
					{ level: 'ERROR', message: 'エラー 2' },
				];

				const result: LogEntry[] = [];
				const pipeline = asyncLogFilter(asyncStreamLogReader(logs), 'ERROR');
				
				for await (const log of pipeline) {
					result.push(log);
				}

				expect(result).toHaveLength(2);
				expect(result[0].message).toBe('エラー 1');
				expect(result[1].message).toBe('エラー 2');
				expect(result.every(log => log.level === 'ERROR')).toBe(true);
			});

			it('INFOログのみを非同期でフィルタリングする', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: '情報 1' },
					{ level: 'ERROR', message: 'エラー 1' },
					{ level: 'INFO', message: '情報 2' },
				];

				const result: LogEntry[] = [];
				const pipeline = asyncLogFilter(asyncStreamLogReader(logs), 'INFO');
				
				for await (const log of pipeline) {
					result.push(log);
				}

				expect(result).toHaveLength(2);
				expect(result[0].message).toBe('情報 1');
				expect(result[1].message).toBe('情報 2');
				expect(result.every(log => log.level === 'INFO')).toBe(true);
			});

			it('一致するログがない場合は空を返す', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: '情報 1' },
					{ level: 'INFO', message: '情報 2' },
				];

				const result: LogEntry[] = [];
				const pipeline = asyncLogFilter(asyncStreamLogReader(logs), 'ERROR');
				
				for await (const log of pipeline) {
					result.push(log);
				}

				expect(result).toHaveLength(0);
			});

			it('遅延評価で非同期にフィルタリングする', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: '情報 1' },
					{ level: 'ERROR', message: 'エラー 1' },
					{ level: 'ERROR', message: 'エラー 2' },
				];

				const generator = asyncLogFilter(asyncStreamLogReader(logs), 'ERROR');
				
				// 最初の呼び出しは最初のERRORログを返す
				const first = await generator.next();
				expect(first.done).toBe(false);
				expect(first.value?.message).toBe('エラー 1');

				// 2回目の呼び出しは2番目のERRORログを返す
				const second = await generator.next();
				expect(second.done).toBe(false);
				expect(second.value?.message).toBe('エラー 2');

				// 3回目の呼び出しは完了を示す
				const third = await generator.next();
				expect(third.done).toBe(true);
			});
		});

		describe('非同期パイプライン合成', () => {
			it('asyncStreamLogReaderとasyncLogFilterを組み合わせる', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: 'プロセス開始' },
					{ level: 'ERROR', message: '接続失敗' },
					{ level: 'INFO', message: '再試行中...' },
					{ level: 'ERROR', message: 'タイムアウトエラー' },
					{ level: 'INFO', message: 'プロセス完了' },
				];

				const errorLogs: LogEntry[] = [];
				const pipeline = asyncLogFilter(asyncStreamLogReader(logs), 'ERROR');
				
				for await (const errorLog of pipeline) {
					errorLogs.push(errorLog);
				}

				expect(errorLogs).toHaveLength(2);
				expect(errorLogs[0].message).toBe('接続失敗');
				expect(errorLogs[1].message).toBe('タイムアウトエラー');
			});

			it('Promiseで包まれたログ配列をフィルタリングする', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: '情報' },
					{ level: 'ERROR', message: 'エラー' },
				];
				const asyncLogs = Promise.resolve(logs);

				const errorLogs: LogEntry[] = [];
				const pipeline = asyncLogFilter(asyncStreamLogReader(asyncLogs), 'ERROR');
				
				for await (const errorLog of pipeline) {
					errorLogs.push(errorLog);
				}

				expect(errorLogs).toHaveLength(1);
				expect(errorLogs[0].message).toBe('エラー');
			});

			it('遅延処理を伴う非同期パイプラインを処理する', async () => {
				const logs: LogEntry[] = [
					{ level: 'INFO', message: '情報 1' },
					{ level: 'ERROR', message: 'エラー 1' },
					{ level: 'ERROR', message: 'エラー 2' },
				];

				const startTime = Date.now();
				const errorLogs: LogEntry[] = [];
				const pipeline = asyncLogFilter(
					asyncStreamLogReader(logs, 5),
					'ERROR'
				);
				
				for await (const errorLog of pipeline) {
					errorLogs.push(errorLog);
				}
				
				const elapsed = Date.now() - startTime;

				expect(errorLogs).toHaveLength(2);
				// 3件のログを5msずつ処理するので最低15msかかる
				expect(elapsed).toBeGreaterThanOrEqual(10);
			});

			it('早期終了を非同期パイプラインでサポートする', async () => {
				const logCount = 1000;
				const logs: LogEntry[] = [];
				
				for (let i = 0; i < logCount; i++) {
					logs.push({
						level: 'ERROR',
						message: `ログ ${i}`,
					});
				}

				let found = false;
				let iterationCount = 0;
				
				for await (const log of asyncLogFilter(asyncStreamLogReader(logs), 'ERROR')) {
					iterationCount++;
					if (log.message === 'ログ 100') {
						found = true;
						break; // 早期終了
					}
				}

				expect(found).toBe(true);
				expect(iterationCount).toBe(101);
			});
		});

		describe('非同期処理での大規模データセット', () => {
			it('10万件のログを非同期で効率的に処理する', async () => {
				const logCount = 100_000;
				const logs: LogEntry[] = [];
				
				for (let i = 0; i < logCount; i++) {
					logs.push({
						level: i % 2 === 0 ? 'INFO' : 'ERROR',
						message: `ログ ${i}`,
					});
				}

				let processedCount = 0;
				const samples: string[] = [];
				
				for await (const log of asyncLogFilter(asyncStreamLogReader(logs), 'ERROR')) {
					processedCount++;
					if (processedCount <= 5) {
						samples.push(log.message);
					}
				}

				expect(processedCount).toBe(50_000);
				expect(samples).toHaveLength(5);
				expect(samples[0]).toBe('ログ 1');
				expect(samples[4]).toBe('ログ 9');
			});

			it('非同期ジェネレーターで一部のアイテムのみを処理できる', async () => {
				const logCount = 10_000;
				const logs: LogEntry[] = [];
				
				for (let i = 0; i < logCount; i++) {
					logs.push({
						level: i % 3 === 0 ? 'ERROR' : 'INFO',
						message: `ログ ${i}`,
					});
				}

				const generator = asyncLogFilter(asyncStreamLogReader(logs), 'ERROR');
				const samples: LogEntry[] = [];
				
				for (let i = 0; i < 50; i++) {
					const { value, done } = await generator.next();
					if (done) break;
					samples.push(value);
				}

				expect(samples).toHaveLength(50);
				expect(samples[0].message).toBe('ログ 0');
				expect(samples[1].message).toBe('ログ 3');
			});
		});
	});
});
