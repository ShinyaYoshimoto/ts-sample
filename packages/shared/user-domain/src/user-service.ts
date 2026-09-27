/**
 * 全 API スタイルで共有するドメイン（業務ロジック）
 *
 * 入力チェック・重複チェック・検索とエラーの仕様はここだけで定義する。
 * 各 API スタイル（REST / tRPC / GraphQL / Connect）は、このサービスを呼び出し、
 * 結果をそのスタイルの流儀（HTTP ステータス、Union 型、oneof など）に変換するだけにする。
 */

export type User = { id: string; email: string; name: string };

export type RegisterUserInput = { email: string; name: string };

/** 入力が不正（どの項目かを field で示す） */
export type ValidationError = {
	code: 'VALIDATION_ERROR';
	field: 'email' | 'name';
	message: string;
};

/** 登録済みのメールアドレス */
export type EmailAlreadyExistsError = {
	code: 'EMAIL_ALREADY_EXISTS';
	message: string;
};

/** 指定した ID のユーザーが存在しない */
export type UserNotFoundError = {
	code: 'USER_NOT_FOUND';
	message: string;
};

export type RegisterUserError = ValidationError | EmailAlreadyExistsError;
export type GetUserError = UserNotFoundError;
export type ApiError = RegisterUserError | GetUserError;

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/** エラーメッセージ（仕様の一部として全スタイルで共通） */
export const messages = {
	emailRequired: 'Email is required',
	invalidEmail: 'Invalid email format',
	nameRequired: 'Name is required',
	emailAlreadyExists: 'User with this email already exists',
	userNotFound: 'User not found',
} as const;

function validate(input: RegisterUserInput): ValidationError | undefined {
	if (input.email.trim() === '') {
		return {
			code: 'VALIDATION_ERROR',
			field: 'email',
			message: messages.emailRequired,
		};
	}
	if (!input.email.includes('@')) {
		return {
			code: 'VALIDATION_ERROR',
			field: 'email',
			message: messages.invalidEmail,
		};
	}
	if (input.name.trim() === '') {
		return {
			code: 'VALIDATION_ERROR',
			field: 'name',
			message: messages.nameRequired,
		};
	}
	return undefined;
}

export type UserService = ReturnType<typeof createUserService>;

/**
 * ユーザーを扱うサービスを作る。ストアはインスタンスごとに独立している（テストで使い回さないため）。
 */
export function createUserService() {
	const users = new Map<string, User>();

	return {
		/** コマンド（副作用あり）: ユーザーを登録する */
		registerUser(input: RegisterUserInput): Result<User, RegisterUserError> {
			const validationError = validate(input);
			if (validationError) {
				return { ok: false, error: validationError };
			}

			const email = input.email.trim();
			for (const user of users.values()) {
				if (user.email === email) {
					return {
						ok: false,
						error: {
							code: 'EMAIL_ALREADY_EXISTS',
							message: messages.emailAlreadyExists,
						},
					};
				}
			}

			const user: User = {
				id: `user-${users.size + 1}`,
				email,
				name: input.name.trim(),
			};
			users.set(user.id, user);
			return { ok: true, value: user };
		},

		/** クエリ（副作用なし）: ID でユーザーを取得する */
		getUser(id: string): Result<User, GetUserError> {
			const user = users.get(id);
			return user
				? { ok: true, value: user }
				: {
						ok: false,
						error: { code: 'USER_NOT_FOUND', message: messages.userNotFound },
					};
		},
	};
}
