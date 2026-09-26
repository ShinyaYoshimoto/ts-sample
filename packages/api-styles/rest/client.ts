import type { hc } from 'hono/client';
import type { ConflictError, User, ValidationError } from './schema';
import type { AppType } from './server';

type Client = ReturnType<typeof hc<AppType>>;

export type RegisterUserResult =
	| { ok: true; user: User }
	| { ok: false; error: ValidationError | ConflictError };

/**
 * ユーザー登録 API を呼び出す。
 *
 * レスポンスの型は HTTP ステータスごとに決まっているため、
 * `res.status` で分岐すると `res.json()` の型が自動で絞り込まれる。
 */
export async function registerUser(
	client: Client,
	input: { email: string; name: string },
): Promise<RegisterUserResult> {
	const res = await client.users.$post({ json: input });

	switch (res.status) {
		case 201:
			// ここでは res.json() は User 型
			return { ok: true, user: await res.json() };
		case 400:
			// ここでは ValidationError 型
			return { ok: false, error: await res.json() };
		case 409:
			// ここでは ConflictError 型
			return { ok: false, error: await res.json() };
		default: {
			// 宣言していないステータスが増えたらコンパイルエラーになる
			const unexpected: never = res;
			throw new Error(`Unexpected response: ${unexpected}`);
		}
	}
}
