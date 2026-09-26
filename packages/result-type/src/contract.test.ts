/**
 * 全実装に共通の仕様テスト
 *
 * 各実装は戻り値の型（例外 / Result / TaskEither / Effect）が異なるため、
 * アダプタで共通の形に揃えたうえで、同じ入力に対して同じ結果になることを検証する。
 *
 * 入力と結果の対応（仕様）はこのファイルで検証し、各実装の index.test.ts には
 * そのライブラリ固有の API の使い方だけを残す。
 */
import { Result as ByethrowResult } from '@praha/byethrow';
import * as E from 'fp-ts/Either';
import { describe, expect, it } from 'vitest';
import * as byethrow from './byethrow';
import * as effectTs from './effect-ts';
import * as fpTs from './fp-ts';
import * as neverthrow from './neverthrow';
import * as unResult from './un-result';

type User = { id: string; email: string; name: string };
type Input = { email: string; name: string };
type AppError = {
	_tag: 'ValidationError' | 'ConflictError' | 'InfrastructureError';
	message: string;
};
type Outcome = { ok: true; user: User } | { ok: false; error: AppError };

const failure = (error: AppError): Outcome => ({
	ok: false,
	error: { _tag: error._tag, message: error.message },
});

const implementations: Record<string, (input: Input) => Promise<Outcome>> = {
	'un-result / registerUser': async (input) => {
		const result = unResult.registerUser(input);
		return result.success
			? { ok: true, user: result.data }
			: failure(result.error);
	},
	'un-result / registerUserAsync': async (input) => {
		const result = await unResult.registerUserAsync(input);
		return result.success
			? { ok: true, user: result.data }
			: failure(result.error);
	},
	'neverthrow / registerUser': async (input) => {
		const result = await neverthrow.registerUser(input);
		return result.isOk()
			? { ok: true, user: result.value }
			: failure(result.error);
	},
	'neverthrow / registerUserFunctional': async (input) => {
		const result = await neverthrow.registerUserFunctional(input);
		return result.isOk()
			? { ok: true, user: result.value }
			: failure(result.error);
	},
	'byethrow / registerUser': async (input) => {
		const result = byethrow.registerUser(input);
		return ByethrowResult.isSuccess(result)
			? { ok: true, user: result.value }
			: failure(result.error);
	},
	'byethrow / registerUserAsync': async (input) => {
		const result = await byethrow.registerUserAsync(input);
		return ByethrowResult.isSuccess(result)
			? { ok: true, user: result.value }
			: failure(result.error);
	},
	'fp-ts / registerUser': async (input) => {
		const result = await fpTs.runTaskEither(fpTs.registerUser(input));
		return E.isRight(result)
			? { ok: true, user: result.right }
			: failure(result.left);
	},
	'fp-ts / registerUserDo': async (input) => {
		const result = await fpTs.runTaskEither(fpTs.registerUserDo(input));
		return E.isRight(result)
			? { ok: true, user: result.right }
			: failure(result.left);
	},
	'effect-ts / registerUser': async (input) => {
		const result = await effectTs.runEffect(effectTs.registerUser(input));
		return result.success
			? { ok: true, user: result.value }
			: failure(result.error);
	},
};

describe.each(Object.entries(implementations))(
	'共通仕様: %s',
	(_name, registerUser) => {
		it('正しい入力ならユーザーを登録できる', async () => {
			const outcome = await registerUser({
				email: 'new@example.com',
				name: 'Jane Doe',
			});
			expect(outcome.ok).toBe(true);
			if (outcome.ok) {
				expect(outcome.user.id).toMatch(/^user-/);
				expect(outcome.user.email).toBe('new@example.com');
				expect(outcome.user.name).toBe('Jane Doe');
			}
		});

		it.each([
			{
				case: 'メールアドレスが空',
				email: '',
				name: 'Jane Doe',
				message: 'Email is required',
			},
			{
				case: 'メールアドレスの形式が不正',
				email: 'invalid',
				name: 'Jane Doe',
				message: 'Invalid email format',
			},
			{
				case: '名前が空',
				email: 'new@example.com',
				name: '',
				message: 'Name is required',
			},
		])('$case なら ValidationError', async ({ email, name, message }) => {
			expect(await registerUser({ email, name })).toEqual({
				ok: false,
				error: { _tag: 'ValidationError', message },
			});
		});

		it('登録済みのメールアドレスなら ConflictError', async () => {
			expect(
				await registerUser({ email: 'test@example.com', name: 'Jane Doe' }),
			).toEqual({
				ok: false,
				error: {
					_tag: 'ConflictError',
					message: 'User with email test@example.com already exists',
				},
			});
		});

		it('保存に失敗したら InfrastructureError', async () => {
			expect(
				await registerUser({ email: 'fail@example.com', name: 'Jane Doe' }),
			).toEqual({
				ok: false,
				error: {
					_tag: 'InfrastructureError',
					message: 'Failed to save user to database',
				},
			});
		});
	},
);
