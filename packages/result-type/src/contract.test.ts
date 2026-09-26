/**
 * 全実装に共通の仕様テスト
 *
 * 各実装は戻り値の型（例外 / Result / TaskEither / Effect）が異なるため、
 * アダプタで共通の形に揃えたうえで、同じ入力に対して同じ結果になることを検証する。
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
type ErrorTag = 'ValidationError' | 'ConflictError' | 'InfrastructureError';
type Outcome = { ok: true; user: User } | { ok: false; tag: ErrorTag };

const implementations: Record<string, (input: Input) => Promise<Outcome>> = {
	'un-result': async (input) => {
		const result = unResult.registerUser(input);
		return result.success
			? { ok: true, user: result.data }
			: { ok: false, tag: result.error._tag };
	},
	neverthrow: async (input) => {
		const result = await neverthrow.registerUser(input);
		return result.isOk()
			? { ok: true, user: result.value }
			: { ok: false, tag: result.error._tag };
	},
	byethrow: async (input) => {
		const result = byethrow.registerUser(input);
		return ByethrowResult.isSuccess(result)
			? { ok: true, user: result.value }
			: { ok: false, tag: result.error._tag };
	},
	'fp-ts': async (input) => {
		const result = await fpTs.runTaskEither(fpTs.registerUser(input));
		return E.isRight(result)
			? { ok: true, user: result.right }
			: { ok: false, tag: result.left._tag };
	},
	'effect-ts': async (input) => {
		const result = await effectTs.runEffect(effectTs.registerUser(input));
		return result.success
			? { ok: true, user: result.value }
			: { ok: false, tag: result.error._tag };
	},
};

describe.each(Object.entries(implementations))(
	'registerUser の共通仕様: %s',
	(_name, registerUser) => {
		it('正しい入力ならユーザーを登録できる', async () => {
			const outcome = await registerUser({
				email: 'new@example.com',
				name: 'Jane Doe',
			});
			expect(outcome.ok).toBe(true);
			if (outcome.ok) {
				expect(outcome.user.email).toBe('new@example.com');
				expect(outcome.user.name).toBe('Jane Doe');
			}
		});

		it.each([
			{ case: 'メールアドレスが空', email: '', name: 'Jane Doe' },
			{
				case: 'メールアドレスの形式が不正',
				email: 'invalid',
				name: 'Jane Doe',
			},
			{ case: '名前が空', email: 'new@example.com', name: '' },
		])('$case なら ValidationError', async ({ email, name }) => {
			expect(await registerUser({ email, name })).toEqual({
				ok: false,
				tag: 'ValidationError',
			});
		});

		it('登録済みのメールアドレスなら ConflictError', async () => {
			expect(
				await registerUser({ email: 'test@example.com', name: 'Jane Doe' }),
			).toEqual({ ok: false, tag: 'ConflictError' });
		});

		it('保存に失敗したら InfrastructureError', async () => {
			expect(
				await registerUser({ email: 'fail@example.com', name: 'Jane Doe' }),
			).toEqual({ ok: false, tag: 'InfrastructureError' });
		});
	},
);
