/**
 * 全 API スタイルに共通の仕様テスト
 *
 * スタイルごとに成否の表し方（HTTP ステータス / Result / Union / oneof）は異なるが、
 * アダプタ（adapters.ts）で共通の形に揃えたうえで、同じ入力に対して同じ結果になることを検証する。
 *
 * 入力と結果の対応（仕様）はこのファイルで検証し、各スタイルのテストには
 * そのスタイル固有の使い方だけを残す。
 */
import { describe, expect, it } from 'vitest';
import { styles } from './adapters';

describe.each(Object.entries(styles))('共通仕様: %s', (_name, createStyle) => {
	describe('registerUser（コマンド）', () => {
		it('正しい入力ならユーザーを登録できる', async () => {
			const client = createStyle();
			expect(
				await client.registerUser({
					email: 'alice@example.com',
					name: 'Alice',
				}),
			).toEqual({
				ok: true,
				user: { id: 'user-1', email: 'alice@example.com', name: 'Alice' },
			});
		});

		it.each([
			{
				case: 'メールアドレスが空',
				email: '',
				name: 'Alice',
				field: 'email',
				message: 'Email is required',
			},
			{
				case: 'メールアドレスの形式が不正',
				email: 'invalid',
				name: 'Alice',
				field: 'email',
				message: 'Invalid email format',
			},
			{
				case: '名前が空',
				email: 'alice@example.com',
				name: ' ',
				field: 'name',
				message: 'Name is required',
			},
		])(
			'$case なら VALIDATION_ERROR',
			async ({ email, name, field, message }) => {
				const client = createStyle();
				expect(await client.registerUser({ email, name })).toEqual({
					ok: false,
					error: { code: 'VALIDATION_ERROR', field, message },
				});
			},
		);

		it('登録済みのメールアドレスなら EMAIL_ALREADY_EXISTS', async () => {
			const client = createStyle();
			await client.registerUser({ email: 'alice@example.com', name: 'Alice' });
			expect(
				await client.registerUser({
					email: 'alice@example.com',
					name: 'Alice 2',
				}),
			).toEqual({
				ok: false,
				error: {
					code: 'EMAIL_ALREADY_EXISTS',
					message: 'User with this email already exists',
				},
			});
		});
	});

	describe('getUser（クエリ）', () => {
		it('登録済みのユーザーを ID で取得できる', async () => {
			const client = createStyle();
			await client.registerUser({ email: 'alice@example.com', name: 'Alice' });
			expect(await client.getUser('user-1')).toEqual({
				ok: true,
				user: { id: 'user-1', email: 'alice@example.com', name: 'Alice' },
			});
		});

		it('存在しない ID なら USER_NOT_FOUND', async () => {
			const client = createStyle();
			expect(await client.getUser('user-999')).toEqual({
				ok: false,
				error: { code: 'USER_NOT_FOUND', message: 'User not found' },
			});
		});
	});
});
