/**
 * GraphQL クライアント（コード生成なし）
 *
 * クエリの結果の型はスキーマに合わせて手書きする。__typename を判別キーにすると、
 * switch や if で Union のメンバーごとに型が絞り込まれる。
 */

export type User = {
	__typename: 'User';
	id: string;
	email: string;
	name: string;
};
export type ValidationError = {
	__typename: 'ValidationError';
	code: 'VALIDATION_ERROR';
	message: string;
	field: 'email' | 'name';
};
export type EmailAlreadyExistsError = {
	__typename: 'EmailAlreadyExistsError';
	code: 'EMAIL_ALREADY_EXISTS';
	message: string;
};
export type UserNotFoundError = {
	__typename: 'UserNotFoundError';
	code: 'USER_NOT_FOUND';
	message: string;
};

export type RegisterUserResult =
	| User
	| ValidationError
	| EmailAlreadyExistsError;
export type UserResult = User | UserNotFoundError;

const USER_FIELDS = /* GraphQL */ `
  __typename
  ... on User { id email name }
  ... on AppError { code message }
`;

export const REGISTER_USER_MUTATION = /* GraphQL */ `
  mutation RegisterUser($email: String!, $name: String!) {
    registerUser(email: $email, name: $name) {
      ${USER_FIELDS}
      ... on ValidationError { field }
    }
  }
`;

export const USER_QUERY = /* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) { ${USER_FIELDS} }
  }
`;

export function createClient(url: string, options?: { fetch?: typeof fetch }) {
	const fetchFn = options?.fetch ?? fetch;

	async function request<T>(
		query: string,
		variables: Record<string, unknown>,
	): Promise<T> {
		const res = await fetchFn(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ query, variables }),
		});
		const body = (await res.json()) as {
			data?: T;
			errors?: { message: string }[];
		};
		if (!body.data) {
			// スキーマ違反などの GraphQL のエラー（業務エラーではない）
			throw new Error(
				body.errors?.map((e) => e.message).join(', ') ??
					'Unknown GraphQL error',
			);
		}
		return body.data;
	}

	return {
		async registerUser(input: {
			email: string;
			name: string;
		}): Promise<RegisterUserResult> {
			const data = await request<{ registerUser: RegisterUserResult }>(
				REGISTER_USER_MUTATION,
				input,
			);
			return data.registerUser;
		},
		async getUser(id: string): Promise<UserResult> {
			const data = await request<{ user: UserResult }>(USER_QUERY, { id });
			return data.user;
		},
	};
}

export type Client = ReturnType<typeof createClient>;
