import * as E from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';
import {
	type AppError,
	type CreateUserInput,
	type User,
	registerUser,
	runTaskEither,
} from './index';

describe('fp-ts implementation', () => {
	describe('Either pattern matching', () => {
		it('should support pattern matching with fold', async () => {
			const input: CreateUserInput = {
				email: 'pattern@example.com',
				name: 'Pattern User',
			};
			const result = await runTaskEither(registerUser(input));
			const message = E.fold(
				(error: AppError) => `Error: ${error.message}`,
				(user: User) => `Success: ${user.email}`,
			)(result);
			expect(message).toContain('Success: pattern@example.com');
		});

		it('should handle errors with fold', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Error User',
			};
			const result = await runTaskEither(registerUser(input));
			const message = E.fold(
				(error: AppError) => `Error: ${error.message}`,
				(user: User) => `Success: ${user.email}`,
			)(result);
			expect(message).toBe('Error: Email is required');
		});
	});
});
