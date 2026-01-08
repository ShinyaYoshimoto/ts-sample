import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

// ========================================
// Data Models & Errors
// ========================================

export type User = { id: string; email: string; name: string };
export type CreateUserInput = { email: string; name: string };

// Errors
export type ValidationError = { _tag: 'ValidationError'; message: string };
export type ConflictError = { _tag: 'ConflictError'; message: string };
export type InfrastructureError = {
	_tag: 'InfrastructureError';
	message: string;
};

export type AppError = ValidationError | ConflictError | InfrastructureError;

// ========================================
// Mock Services
// ========================================

/**
 * Validates the input for creating a user.
 * Returns ValidationError if email is empty or invalid format.
 */
export function validateInput(
	input: CreateUserInput,
): TE.TaskEither<ValidationError, CreateUserInput> {
	// Simple email validation
	if (!input.email || input.email.trim() === '') {
		return TE.left({
			_tag: 'ValidationError',
			message: 'Email is required',
		});
	}

	if (!input.email.includes('@')) {
		return TE.left({
			_tag: 'ValidationError',
			message: 'Invalid email format',
		});
	}

	if (!input.name || input.name.trim() === '') {
		return TE.left({
			_tag: 'ValidationError',
			message: 'Name is required',
		});
	}

	return TE.right(input);
}

/**
 * Checks if a user with the given email already exists.
 * Returns ConflictError if user exists.
 */
export function checkUserExists(
	email: string,
): TE.TaskEither<ConflictError, void> {
	return TE.tryCatch(
		async () => {
			// Mock: user with test@example.com already exists
			if (email === 'test@example.com') {
				throw new Error(`User with email ${email} already exists`);
			}
			return undefined;
		},
		(reason) => ({
			_tag: 'ConflictError' as const,
			message: String(reason).replace('Error: ', ''),
		}),
	);
}

/**
 * Saves a user to the database.
 * Returns InfrastructureError on failure.
 */
export function saveUser(user: User): TE.TaskEither<InfrastructureError, User> {
	return TE.tryCatch(
		async () => {
			// Mock: simulate random infrastructure failure
			const shouldFail = user.email.includes('fail');

			if (shouldFail) {
				throw new Error('Failed to save user to database');
			}

			return user;
		},
		(reason) => ({
			_tag: 'InfrastructureError' as const,
			message: String(reason).replace('Error: ', ''),
		}),
	);
}

// ========================================
// Main UseCase: Register User
// ========================================

/**
 * Registers a new user by validating input, checking for conflicts,
 * and saving to the database.
 *
 * This demonstrates fp-ts's TaskEither composition using pipe.
 * The type system tracks all possible errors through the pipeline.
 */
export function registerUser(
	input: CreateUserInput,
): TE.TaskEither<AppError, User> {
	return pipe(
		// Step 1: Validate input
		validateInput(input),
		// Step 2: Check if user exists
		TE.chainW((validatedInput) =>
			pipe(
				checkUserExists(validatedInput.email),
				TE.map(() => validatedInput),
			),
		),
		// Step 3: Create and save user
		TE.chainW((validatedInput) => {
			const user: User = {
				id: `user-${Date.now()}`,
				email: validatedInput.email,
				name: validatedInput.name,
			};
			return saveUser(user);
		}),
	);
}

// ========================================
// Alternative: Using do notation
// ========================================

/**
 * Alternative implementation using fp-ts's do notation
 * for more imperative-style composition.
 */
export function registerUserDo(
	input: CreateUserInput,
): TE.TaskEither<AppError, User> {
	return pipe(
		TE.Do,
		TE.bindW('validatedInput', () => validateInput(input)),
		TE.bindW('_checkExists', ({ validatedInput }) =>
			checkUserExists(validatedInput.email),
		),
		TE.bindW('user', ({ validatedInput }) =>
			TE.right<AppError, User>({
				id: `user-${Date.now()}`,
				email: validatedInput.email,
				name: validatedInput.name,
			}),
		),
		TE.chainW(({ user }) => saveUser(user)),
	);
}

// ========================================
// Helper: Convert TaskEither to Promise Result
// ========================================

/**
 * Helper function to run a TaskEither and get a Promise-based Either.
 */
export async function runTaskEither<E, A>(
	task: TE.TaskEither<E, A>,
): Promise<E.Either<E, A>> {
	return await task();
}
