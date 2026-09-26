/**
 * User entity
 */
export type User = {
	id: string;
	name: string;
	email: string;
};

/**
 * Application error types
 */
export type AppError =
	| { type: 'VALIDATION_ERROR'; message: string }
	| { type: 'DUPLICATE_EMAIL'; email: string }
	| { type: 'DATABASE_ERROR'; message: string };
