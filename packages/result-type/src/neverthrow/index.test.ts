import { ResultAsync, err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';
import { registerUser } from './index';

describe('neverthrow implementation', () => {
	describe('neverthrow API usage', () => {
		it('should work with isOk / isErr', () => {
			expect(ok(42).isOk()).toBe(true);
			expect(err('error').isErr()).toBe(true);
		});

		it('should support method chaining with map / andThen', () => {
			const result = ok(5)
				.map((x) => x * 2)
				.andThen((x) => ok(x + 1));
			expect(result._unsafeUnwrap()).toBe(11);
		});

		it('should handle both cases with match', async () => {
			const result = await registerUser({
				email: 'test@example.com',
				name: 'Jane Doe',
			});
			const message = result.match(
				(user) => `registered: ${user.id}`,
				(error) => `failed: ${error._tag}`,
			);
			expect(message).toBe('failed: ConflictError');
		});

		it('should chain async results with ResultAsync', async () => {
			const result = await ResultAsync.fromSafePromise(Promise.resolve(5))
				.map((x) => x * 2)
				.andThen((x) => (x > 5 ? ok(x) : err('too small')));
			expect(result.isOk()).toBe(true);
			expect(result._unsafeUnwrap()).toBe(10);
		});
	});
});
