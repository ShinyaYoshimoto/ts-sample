import { z } from '@hono/zod-openapi';

/**
 * API のスキーマ定義
 *
 * zod のスキーマが「リクエストの形の検証」「TypeScript の型」「OpenAPI ドキュメント」の元になる。
 * メールアドレスの形式などの業務ルールは全スタイル共通のドメイン（../domain）で判定し、
 * ここでは型（文字列であること）だけを検証する。
 */

export const RegisterUserRequestSchema = z
	.object({
		email: z.string().openapi({ example: 'alice@example.com' }),
		name: z.string().openapi({ example: 'Alice' }),
	})
	.openapi('RegisterUserRequest');

export const UserIdParamSchema = z.object({
	id: z
		.string()
		.openapi({ param: { name: 'id', in: 'path' }, example: 'user-1' }),
});

export const UserSchema = z
	.object({
		id: z.string().openapi({ example: 'user-1' }),
		email: z.string(),
		name: z.string(),
	})
	.openapi('User');

/** 400: 入力が不正 */
export const ValidationErrorSchema = z
	.object({
		code: z.literal('VALIDATION_ERROR'),
		field: z.enum(['email', 'name']),
		message: z.string(),
	})
	.openapi('ValidationError');

/** 409: 登録済みのメールアドレス */
export const EmailAlreadyExistsErrorSchema = z
	.object({
		code: z.literal('EMAIL_ALREADY_EXISTS'),
		message: z.string(),
	})
	.openapi('EmailAlreadyExistsError');

/** 404: ユーザーが存在しない */
export const UserNotFoundErrorSchema = z
	.object({
		code: z.literal('USER_NOT_FOUND'),
		message: z.string(),
	})
	.openapi('UserNotFoundError');
