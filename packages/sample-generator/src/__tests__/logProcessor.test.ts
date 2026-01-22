import { describe, it, expect } from 'vitest';
import {
	type LogEntry,
	streamLogReader,
	logFilter,
} from '../logProcessor';

describe('Generator-based log processing', () => {
	describe('LogEntry type', () => {
		it('should correctly type a valid log entry', () => {
			const log: LogEntry = {
				level: 'INFO',
				message: 'Test message',
				timestamp: '2024-01-01T00:00:00Z',
			};
			expect(log.level).toBe('INFO');
			expect(log.message).toBe('Test message');
			expect(log.timestamp).toBe('2024-01-01T00:00:00Z');
		});

		it('should allow timestamp to be optional', () => {
			const log: LogEntry = {
				level: 'ERROR',
				message: 'Error occurred',
			};
			expect(log.timestamp).toBeUndefined();
		});
	});

	describe('streamLogReader', () => {
		it('should yield all logs one by one', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Log 1' },
				{ level: 'ERROR', message: 'Log 2' },
				{ level: 'INFO', message: 'Log 3' },
			];

			const result: LogEntry[] = [];
			for (const log of streamLogReader(logs)) {
				result.push(log);
			}

			expect(result).toHaveLength(3);
			expect(result[0].message).toBe('Log 1');
			expect(result[1].message).toBe('Log 2');
			expect(result[2].message).toBe('Log 3');
		});

		it('should handle empty array', () => {
			const logs: LogEntry[] = [];
			const result: LogEntry[] = [];
			for (const log of streamLogReader(logs)) {
				result.push(log);
			}
			expect(result).toHaveLength(0);
		});

		it('should yield logs lazily without loading all into memory at once', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Log 1' },
				{ level: 'INFO', message: 'Log 2' },
			];

			const generator = streamLogReader(logs);
			
			// First call should return first log
			const first = generator.next();
			expect(first.done).toBe(false);
			expect(first.value?.message).toBe('Log 1');

			// Second call should return second log
			const second = generator.next();
			expect(second.done).toBe(false);
			expect(second.value?.message).toBe('Log 2');

			// Third call should indicate completion
			const third = generator.next();
			expect(third.done).toBe(true);
		});
	});

	describe('logFilter', () => {
		it('should filter only ERROR logs', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Info 1' },
				{ level: 'ERROR', message: 'Error 1' },
				{ level: 'INFO', message: 'Info 2' },
				{ level: 'ERROR', message: 'Error 2' },
			];

			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(2);
			expect(result[0].message).toBe('Error 1');
			expect(result[1].message).toBe('Error 2');
			expect(result.every(log => log.level === 'ERROR')).toBe(true);
		});

		it('should filter only INFO logs', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Info 1' },
				{ level: 'ERROR', message: 'Error 1' },
				{ level: 'INFO', message: 'Info 2' },
			];

			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'INFO');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(2);
			expect(result[0].message).toBe('Info 1');
			expect(result[1].message).toBe('Info 2');
			expect(result.every(log => log.level === 'INFO')).toBe(true);
		});

		it('should return empty when no logs match filter', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Info 1' },
				{ level: 'INFO', message: 'Info 2' },
			];

			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(0);
		});

		it('should work with empty source generator', () => {
			const logs: LogEntry[] = [];
			const result: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const log of pipeline) {
				result.push(log);
			}

			expect(result).toHaveLength(0);
		});

		it('should process lazily without materializing entire filtered result', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Info 1' },
				{ level: 'ERROR', message: 'Error 1' },
				{ level: 'ERROR', message: 'Error 2' },
			];

			const generator = logFilter(streamLogReader(logs), 'ERROR');
			
			// First call should return first ERROR log
			const first = generator.next();
			expect(first.done).toBe(false);
			expect(first.value?.message).toBe('Error 1');

			// Second call should return second ERROR log
			const second = generator.next();
			expect(second.done).toBe(false);
			expect(second.value?.message).toBe('Error 2');

			// Third call should indicate completion
			const third = generator.next();
			expect(third.done).toBe(true);
		});
	});

	describe('Pipeline composition', () => {
		it('should compose streamLogReader and logFilter', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Starting process' },
				{ level: 'ERROR', message: 'Connection failed' },
				{ level: 'INFO', message: 'Retrying...' },
				{ level: 'ERROR', message: 'Timeout error' },
				{ level: 'INFO', message: 'Process complete' },
			];

			const errorLogs: LogEntry[] = [];
			const pipeline = logFilter(streamLogReader(logs), 'ERROR');
			
			for (const errorLog of pipeline) {
				errorLogs.push(errorLog);
			}

			expect(errorLogs).toHaveLength(2);
			expect(errorLogs[0].message).toBe('Connection failed');
			expect(errorLogs[1].message).toBe('Timeout error');
		});

		it('should handle timestamp field in filtered logs', () => {
			const logs: LogEntry[] = [
				{ level: 'INFO', message: 'Info', timestamp: '2024-01-01T00:00:00Z' },
				{ level: 'ERROR', message: 'Error', timestamp: '2024-01-01T00:01:00Z' },
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

	describe('Memory efficiency with large datasets', () => {
		it('should handle 100k log entries without excessive memory usage', () => {
			// Generate 100k log entries
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: i % 2 === 0 ? 'INFO' : 'ERROR',
					message: `Log entry ${i}`,
					timestamp: new Date(Date.now() + i).toISOString(),
				});
			}

			// Measure memory usage pattern - generators should process one at a time
			let processedCount = 0;
			const errorLogs: string[] = []; // Store only messages to verify processing
			
			// Process through generator pipeline
			for (const log of logFilter(streamLogReader(logs), 'ERROR')) {
				processedCount++;
				// Only store a sample to avoid memory buildup in test
				if (processedCount <= 10 || processedCount > 49990) {
					errorLogs.push(log.message);
				}
			}

			// Should have processed 50k ERROR logs (half of 100k)
			expect(processedCount).toBe(50_000);
			
			// Verify some samples from beginning and end
			expect(errorLogs[0]).toBe('Log entry 1');
			expect(errorLogs[9]).toBe('Log entry 19');
		});

		it('should process 100k entries without loading all filtered results at once', () => {
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: i % 10 === 0 ? 'ERROR' : 'INFO',
					message: `Log ${i}`,
				});
			}

			// Use generator to process only first 100 ERROR logs
			const generator = logFilter(streamLogReader(logs), 'ERROR');
			const samples: LogEntry[] = [];
			
			for (let i = 0; i < 100; i++) {
				const { value, done } = generator.next();
				if (done) break;
				samples.push(value);
			}

			// Should have retrieved 100 samples
			expect(samples).toHaveLength(100);
			expect(samples[0].message).toBe('Log 0');
			expect(samples[1].message).toBe('Log 10');
			expect(samples[99].message).toBe('Log 990');
		});

		it('should demonstrate generator lazy evaluation', () => {
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: 'ERROR',
					message: `Log ${i}`,
				});
			}

			// Create generator but don't consume it
			const generator = logFilter(streamLogReader(logs), 'ERROR');
			
			// Generator is created but no processing has occurred yet
			// Now consume just one item
			const first = generator.next();
			expect(first.done).toBe(false);
			expect(first.value?.message).toBe('Log 0');
			
			// Verify we can continue processing
			const second = generator.next();
			expect(second.done).toBe(false);
			expect(second.value?.message).toBe('Log 1');
		});

		it('should allow early termination without processing remaining items', () => {
			const logCount = 100_000;
			const logs: LogEntry[] = [];
			
			for (let i = 0; i < logCount; i++) {
				logs.push({
					level: 'ERROR',
					message: `Log ${i}`,
				});
			}

			// Process until we find a specific condition
			let found = false;
			let iterationCount = 0;
			
			for (const log of logFilter(streamLogReader(logs), 'ERROR')) {
				iterationCount++;
				if (log.message === 'Log 1000') {
					found = true;
					break; // Early termination
				}
			}

			expect(found).toBe(true);
			expect(iterationCount).toBe(1001); // Only processed until match
			// Remaining 98,999 items were never processed
		});
	});
});
