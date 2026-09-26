import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import { type CreateUserInput, registerUser } from './index';

describe('effect-ts implementation', () => {
	describe('Effect integration', () => {
		it('should work with Effect.runPromise', async () => {
			const input: CreateUserInput = {
				email: 'direct@example.com',
				name: 'Direct User',
			};
			const user = await Effect.runPromise(registerUser(input));
			expect(user.email).toBe(input.email);
			expect(user.name).toBe(input.name);
		});

		it('should catch errors with Effect.catchAll', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Invalid User',
			};
			const result = await Effect.runPromise(
				Effect.catchAll(registerUser(input), (error) =>
					Effect.succeed({ error: error.message }),
				),
			);
			expect(result).toHaveProperty('error');
			expect((result as any).error).toBe('Email is required');
		});
	});
});
