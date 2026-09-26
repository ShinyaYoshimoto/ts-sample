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
// Mock Services (using throw for errors)
// ========================================

/**
 * Validates the input for creating a user.
 * Throws ValidationError if validation fails.
 *
 * NOTE: This uses simplified validation for demonstration purposes.
 * Production code should use a proper email validation library.
 */
export function validateInput(input: CreateUserInput): CreateUserInput {
	// Simple email validation (for demo purposes only)
	if (!input.email || input.email.trim() === '') {
		throw {
			_tag: 'ValidationError',
			message: 'Email is required',
		} as ValidationError;
	}

	if (!input.email.includes('@')) {
		throw {
			_tag: 'ValidationError',
			message: 'Invalid email format',
		} as ValidationError;
	}

	if (!input.name || input.name.trim() === '') {
		throw {
			_tag: 'ValidationError',
			message: 'Name is required',
		} as ValidationError;
	}

	return input;
}

/**
 * Checks if a user with the given email already exists.
 * Throws ConflictError if user exists.
 */
export function checkUserExists(email: string): void {
	// Mock: user with test@example.com already exists
	if (email === 'test@example.com') {
		throw {
			_tag: 'ConflictError',
			message: `User with email ${email} already exists`,
		} as ConflictError;
	}
}

/**
 * Saves a user to the database.
 * Throws InfrastructureError on failure.
 */
export function saveUser(user: User): User {
	// Mock: simulate random infrastructure failure
	const shouldFail = user.email.includes('fail');

	if (shouldFail) {
		throw {
			_tag: 'InfrastructureError',
			message: 'Failed to save user to database',
		} as InfrastructureError;
	}

	return user;
}

// ========================================
// Main UseCase: Register User (using try-catch)
// ========================================

/**
 * Registers a new user by validating input, checking for conflicts,
 * and saving to the database.
 *
 * This demonstrates traditional error handling using try-catch blocks.
 * Errors are caught and returned as part of the response.
 */
export function registerUser(
	input: CreateUserInput,
): { success: true; data: User } | { success: false; error: AppError } {
	try {
		// Step 1: Validate input
		const validatedInput = validateInput(input);

		// Step 2: Check if user exists
		checkUserExists(validatedInput.email);

		// Step 3: Create and save user
		const user: User = {
			id: `user-${Date.now()}`,
			email: validatedInput.email,
			name: validatedInput.name,
		};

		const savedUser = saveUser(user);

		return { success: true, data: savedUser };
	} catch (error) {
		// Type guard to ensure error is AppError
		if (
			error &&
			typeof error === 'object' &&
			'_tag' in error &&
			'message' in error
		) {
			return { success: false, error: error as AppError };
		}
		// Fallback for unexpected errors
		return {
			success: false,
			error: {
				_tag: 'InfrastructureError',
				message: 'An unexpected error occurred',
			},
		};
	}
}

// ========================================
// Alternative: Async version
// ========================================

/**
 * Async version of registerUser showing traditional async error handling.
 */
export async function registerUserAsync(
	input: CreateUserInput,
): Promise<
	{ success: true; data: User } | { success: false; error: AppError }
> {
	// Simulate async operations
	const validateAsync = async (
		input: CreateUserInput,
	): Promise<CreateUserInput> => {
		await new Promise((resolve) => setTimeout(resolve, 1));
		return validateInput(input);
	};

	const checkExistsAsync = async (email: string): Promise<void> => {
		await new Promise((resolve) => setTimeout(resolve, 1));
		checkUserExists(email);
	};

	const saveUserAsync = async (user: User): Promise<User> => {
		await new Promise((resolve) => setTimeout(resolve, 1));
		return saveUser(user);
	};

	try {
		const validatedInput = await validateAsync(input);
		await checkExistsAsync(validatedInput.email);

		const user: User = {
			id: `user-${Date.now()}`,
			email: validatedInput.email,
			name: validatedInput.name,
		};

		const savedUser = await saveUserAsync(user);

		return { success: true, data: savedUser };
	} catch (error) {
		if (
			error &&
			typeof error === 'object' &&
			'_tag' in error &&
			'message' in error
		) {
			return { success: false, error: error as AppError };
		}
		return {
			success: false,
			error: {
				_tag: 'InfrastructureError',
				message: 'An unexpected error occurred',
			},
		};
	}
}

// ========================================
// Alternative: Using null/undefined for errors
// ========================================

/**
 * Alternative implementation returning null on error.
 * This is a common pattern but loses error information.
 */
export function registerUserNullable(input: CreateUserInput): User | null {
	try {
		const validatedInput = validateInput(input);
		checkUserExists(validatedInput.email);

		const user: User = {
			id: `user-${Date.now()}`,
			email: validatedInput.email,
			name: validatedInput.name,
		};

		return saveUser(user);
	} catch {
		return null;
	}
}
