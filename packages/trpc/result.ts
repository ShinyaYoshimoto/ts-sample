/**
 * Success result with data
 */
export type Success<T> = {
	status: 'ok';
	data: T;
};

/**
 * Failure result with error
 */
export type Failure<E> = {
	status: 'error';
	error: E;
};

/**
 * Result type as a discriminated union
 * Can be either Success or Failure
 */
export type Result<T, E> = Success<T> | Failure<E>;

/**
 * Helper function to create a success result
 */
export function success<T>(data: T): Success<T> {
	return { status: 'ok', data };
}

/**
 * Helper function to create a failure result
 */
export function failure<E>(error: E): Failure<E> {
	return { status: 'error', error };
}
