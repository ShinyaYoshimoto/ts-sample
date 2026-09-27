import type { ApiError, UserService } from '../../domain/user-service';

/** ドメインのエラーコードを、GraphQL スキーマの型名に対応付ける */
const typeNameByCode = {
	VALIDATION_ERROR: 'ValidationError',
	EMAIL_ALREADY_EXISTS: 'EmailAlreadyExistsError',
	USER_NOT_FOUND: 'UserNotFoundError',
} as const satisfies Record<ApiError['code'], string>;

function toGraphQL<T>(
	result: { ok: true; value: T } | { ok: false; error: ApiError },
) {
	return result.ok
		? { __typename: 'User' as const, ...result.value }
		: { __typename: typeNameByCode[result.error.code], ...result.error };
}

const resolveType = (obj: { __typename: string }) => obj.__typename;

export function createResolvers(service: UserService) {
	return {
		Query: {
			user: (_parent: unknown, args: { id: string }) =>
				toGraphQL(service.getUser(args.id)),
		},
		Mutation: {
			registerUser: (_parent: unknown, args: { email: string; name: string }) =>
				toGraphQL(service.registerUser(args)),
		},
		RegisterUserResult: { __resolveType: resolveType },
		UserResult: { __resolveType: resolveType },
		AppError: { __resolveType: resolveType },
	};
}
