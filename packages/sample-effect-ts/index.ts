import { Effect, pipe } from 'effect';

// ========================================
// Data Models & Errors
// ========================================

export type User = { id: string; email: string; name: string };
export type CreateUserInput = { email: string; name: string };

// Errors - Using tagged errors for Effect
export class ValidationError {
	readonly _tag = 'ValidationError';
	constructor(readonly message: string) {}
}

export class ConflictError {
	readonly _tag = 'ConflictError';
	constructor(readonly message: string) {}
}

export class InfrastructureError {
	readonly _tag = 'InfrastructureError';
	constructor(readonly message: string) {}
}

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
): Effect.Effect<CreateUserInput, ValidationError> {
	// Simple email validation
	if (!input.email || input.email.trim() === '') {
		return Effect.fail(new ValidationError('Email is required'));
	}

	if (!input.email.includes('@')) {
		return Effect.fail(new ValidationError('Invalid email format'));
	}

	if (!input.name || input.name.trim() === '') {
		return Effect.fail(new ValidationError('Name is required'));
	}

	return Effect.succeed(input);
}

/**
 * Checks if a user with the given email already exists.
 * Returns ConflictError if user exists.
 */
export function checkUserExists(
	email: string,
): Effect.Effect<void, ConflictError> {
	// Mock: user with test@example.com already exists
	if (email === 'test@example.com') {
		return Effect.fail(
			new ConflictError(`User with email ${email} already exists`),
		);
	}

	return Effect.void;
}

/**
 * Saves a user to the database.
 * Returns InfrastructureError on failure.
 */
export function saveUser(
	user: User,
): Effect.Effect<User, InfrastructureError> {
	// Mock: simulate random infrastructure failure
	const shouldFail = user.email.includes('fail');

	if (shouldFail) {
		return Effect.fail(
			new InfrastructureError('Failed to save user to database'),
		);
	}

	return Effect.succeed(user);
}

// ========================================
// Main UseCase: Register User
// ========================================

/**
 * Registers a new user by validating input, checking for conflicts,
 * and saving to the database.
 *
 * This demonstrates Effect's elegant composition and error handling.
 * Effect automatically tracks all possible error types in the type system.
 */
export function registerUser(
	input: CreateUserInput,
): Effect.Effect<User, AppError> {
	return pipe(
		// Step 1: Validate input
		validateInput(input),
		// Step 2: Check if user exists
		Effect.flatMap((validatedInput) =>
			pipe(
				checkUserExists(validatedInput.email),
				Effect.map(() => validatedInput),
			),
		),
		// Step 3: Create and save user
		Effect.flatMap((validatedInput) => {
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
// Helper: Run Effect and convert to Promise
// ========================================

/**
 * Helper function to run an Effect and get a Promise-based Result.
 * This makes it easier to use Effects in async/await contexts.
 */
export async function runEffect<A, E>(
	effect: Effect.Effect<A, E>,
): Promise<{ success: true; value: A } | { success: false; error: E }> {
	const exit = await Effect.runPromiseExit(effect);

	if (exit._tag === 'Success') {
		return { success: true, value: exit.value };
	} else {
		// Extract the actual error from the Cause
		const cause = exit.cause;
		if (cause._tag === 'Fail') {
			return { success: false, error: cause.error as E };
		}
		// Fallback for other error types
		throw new Error('Unexpected error type');
	}
}
