import * as E from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';
import {
	type AppError,
	type CreateUserInput,
	type User,
	checkUserExists,
	registerUser,
	registerUserDo,
	runTaskEither,
	saveUser,
	validateInput,
} from './index';

describe('fp-ts implementation', () => {
	describe('validateInput', () => {
		it('should return Right for valid input', async () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = await runTaskEither(validateInput(input));
			expect(E.isRight(result)).toBe(true);
			if (E.isRight(result)) {
				expect(result.right).toEqual(input);
			}
		});

		it('should return Left with ValidationError for empty email', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'John Doe',
			};
			const result = await runTaskEither(validateInput(input));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('ValidationError');
				expect(result.left.message).toBe('Email is required');
			}
		});

		it('should return Left with ValidationError for invalid email format', async () => {
			const input: CreateUserInput = {
				email: 'invalid-email',
				name: 'John Doe',
			};
			const result = await runTaskEither(validateInput(input));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('ValidationError');
				expect(result.left.message).toBe('Invalid email format');
			}
		});

		it('should return Left with ValidationError for empty name', async () => {
			const input: CreateUserInput = {
				email: 'user@example.com',
				name: '',
			};
			const result = await runTaskEither(validateInput(input));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('ValidationError');
				expect(result.left.message).toBe('Name is required');
			}
		});
	});

	describe('checkUserExists', () => {
		it('should return Right if user does not exist', async () => {
			const result = await runTaskEither(
				checkUserExists('newuser@example.com'),
			);
			expect(E.isRight(result)).toBe(true);
		});

		it('should return Left with ConflictError if user exists', async () => {
			const result = await runTaskEither(checkUserExists('test@example.com'));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('ConflictError');
				expect(result.left.message).toContain('already exists');
			}
		});
	});

	describe('saveUser', () => {
		it('should return Right when save succeeds', async () => {
			const user = {
				id: 'user-123',
				email: 'user@example.com',
				name: 'John Doe',
			};
			const result = await runTaskEither(saveUser(user));
			expect(E.isRight(result)).toBe(true);
			if (E.isRight(result)) {
				expect(result.right).toEqual(user);
			}
		});

		it('should return Left with InfrastructureError when save fails', async () => {
			const user = {
				id: 'user-123',
				email: 'fail@example.com',
				name: 'John Doe',
			};
			const result = await runTaskEither(saveUser(user));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('InfrastructureError');
				expect(result.left.message).toContain('Failed to save');
			}
		});
	});

	describe('registerUser', () => {
		it('should successfully register a valid user', async () => {
			const input: CreateUserInput = {
				email: 'newuser@example.com',
				name: 'Jane Doe',
			};
			const result = await runTaskEither(registerUser(input));
			expect(E.isRight(result)).toBe(true);
			if (E.isRight(result)) {
				expect(result.right.email).toBe(input.email);
				expect(result.right.name).toBe(input.name);
				expect(result.right.id).toBeDefined();
			}
		});

		it('should return Left with ValidationError for invalid input', async () => {
			const input: CreateUserInput = {
				email: '',
				name: 'Jane Doe',
			};
			const result = await runTaskEither(registerUser(input));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('ValidationError');
			}
		});

		it('should return Left with ConflictError if user exists', async () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = await runTaskEither(registerUser(input));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('ConflictError');
			}
		});

		it('should return Left with InfrastructureError if save fails', async () => {
			const input: CreateUserInput = {
				email: 'fail@example.com',
				name: 'Jane Doe',
			};
			const result = await runTaskEither(registerUser(input));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('InfrastructureError');
			}
		});
	});

	describe('registerUserDo', () => {
		it('should successfully register a valid user', async () => {
			const input: CreateUserInput = {
				email: 'newuser2@example.com',
				name: 'Jane Doe',
			};
			const result = await runTaskEither(registerUserDo(input));
			expect(E.isRight(result)).toBe(true);
			if (E.isRight(result)) {
				expect(result.right.email).toBe(input.email);
				expect(result.right.name).toBe(input.name);
			}
		});

		it('should return Left with ConflictError if user exists', async () => {
			const input: CreateUserInput = {
				email: 'test@example.com',
				name: 'Jane Doe',
			};
			const result = await runTaskEither(registerUserDo(input));
			expect(E.isLeft(result)).toBe(true);
			if (E.isLeft(result)) {
				expect(result.left._tag).toBe('ConflictError');
			}
		});
	});

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
