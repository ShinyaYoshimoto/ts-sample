import { Result } from '@praha/byethrow';
import { describe, expect, it } from 'vitest';

describe('byethrow implementation', () => {
	describe('byethrow API usage', () => {
		it('should work with Result.isSuccess', () => {
			const result = Result.succeed(42);
			expect(Result.isSuccess(result)).toBe(true);
		});

		it('should work with Result.isFailure', () => {
			const result = Result.fail('error');
			expect(Result.isFailure(result)).toBe(true);
		});

		it('should support pipe composition', () => {
			const result = Result.pipe(
				Result.succeed(5),
				Result.andThen((x) => Result.succeed(x * 2)),
				Result.andThen((x) => Result.succeed(x + 1)),
			);
			expect(Result.isSuccess(result)).toBe(true);
			if (Result.isSuccess(result)) {
				expect(result.value).toBe(11);
			}
		});
	});
});
