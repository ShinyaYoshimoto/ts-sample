import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { type UserService, createUserService } from '../domain/user-service';
import { type Result, failure, success } from './result';
import type { GetUserError, RegisterUserError, User } from './types';

const t = initTRPC.create();

/**
 * tRPC のルーターを作る
 *
 * - コマンド（副作用あり）は mutation、クエリ（副作用なし）は query として定義する
 * - 業務エラーは TRPCError を throw せず、Result 型として通常のレスポンスで返す
 * - 入力の形（文字列であること）は zod で検証する。形が不正な場合は tRPC 標準の BAD_REQUEST になる
 */
export function createAppRouter(service: UserService = createUserService()) {
	const toResult = <T, E>(
		result: { ok: true; value: T } | { ok: false; error: E },
	): Result<T, E> =>
		result.ok ? success(result.value) : failure(result.error);

	return t.router({
		registerUser: t.procedure
			.input(z.object({ email: z.string(), name: z.string() }))
			.mutation(
				({ input }): Result<User, RegisterUserError> =>
					toResult(service.registerUser(input)),
			),

		getUser: t.procedure
			.input(z.object({ id: z.string() }))
			.query(
				({ input }): Result<User, GetUserError> =>
					toResult(service.getUser(input.id)),
			),
	});
}

/** クライアントが import する型 */
export type AppRouter = ReturnType<typeof createAppRouter>;
