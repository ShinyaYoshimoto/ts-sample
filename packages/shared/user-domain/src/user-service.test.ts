import { describe, expect, it } from 'vitest';
import { createUserService } from './user-service';

describe('createUserService', () => {
	describe('registerUser', () => {
		it('登録すると ID が user-1, user-2, … と振られ、前後の空白は除かれる', () => {
			const service = createUserService();
			expect(
				service.registerUser({ email: ' a@example.com ', name: ' A ' }),
			).toEqual({
				ok: true,
				value: { id: 'user-1', email: 'a@example.com', name: 'A' },
			});
			expect(
				service.registerUser({ email: 'b@example.com', name: 'B' }),
			).toMatchObject({
				ok: true,
				value: { id: 'user-2' },
			});
		});

		it.each([
			{ email: '', name: 'A', field: 'email', message: 'Email is required' },
			{
				email: 'invalid',
				name: 'A',
				field: 'email',
				message: 'Invalid email format',
			},
			{
				email: 'a@example.com',
				name: ' ',
				field: 'name',
				message: 'Name is required',
			},
		])(
			'入力が不正なら VALIDATION_ERROR（$field: $message）',
			({ email, name, field, message }) => {
				expect(createUserService().registerUser({ email, name })).toEqual({
					ok: false,
					error: { code: 'VALIDATION_ERROR', field, message },
				});
			},
		);

		it('登録済みのメールアドレスなら EMAIL_ALREADY_EXISTS', () => {
			const service = createUserService();
			service.registerUser({ email: 'a@example.com', name: 'A' });
			expect(
				service.registerUser({ email: 'a@example.com', name: 'A2' }),
			).toEqual({
				ok: false,
				error: {
					code: 'EMAIL_ALREADY_EXISTS',
					message: 'User with this email already exists',
				},
			});
		});
	});

	describe('getUser', () => {
		it('登録済みのユーザーを取得でき、存在しなければ USER_NOT_FOUND', () => {
			const service = createUserService();
			service.registerUser({ email: 'a@example.com', name: 'A' });
			expect(service.getUser('user-1')).toEqual({
				ok: true,
				value: { id: 'user-1', email: 'a@example.com', name: 'A' },
			});
			expect(service.getUser('user-999')).toEqual({
				ok: false,
				error: { code: 'USER_NOT_FOUND', message: 'User not found' },
			});
		});

		it('サービスのインスタンスごとにストアは独立している', () => {
			createUserService().registerUser({ email: 'a@example.com', name: 'A' });
			expect(createUserService().getUser('user-1').ok).toBe(false);
		});
	});
});
