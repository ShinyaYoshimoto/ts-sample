import { z } from '@hono/zod-openapi';

/**
 * API のスキーマ定義
 *
 * zod のスキーマが「入力の検証」「TypeScript の型」「OpenAPI ドキュメント」の3つの元になる。
 */

export const RegisterUserRequestSchema = z
	.object({
		email: z.email({ message: 'Invalid email format' }).openapi({
			example: 'alice@example.com',
		}),
		name: z.string().min(1, { message: 'Name is required' }).openapi({
			example: 'Alice',
		}),
	})
	.openapi('RegisterUserRequest');

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
		type: z.literal('VALIDATION_ERROR'),
		message: z.string(),
		field: z.string().optional(),
	})
	.openapi('ValidationError');

/** 409: 登録済みのメールアドレス */
export const ConflictErrorSchema = z
	.object({
		type: z.literal('DUPLICATE_EMAIL'),
		message: z.string(),
		email: z.string(),
	})
	.openapi('ConflictError');

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;
export type User = z.infer<typeof UserSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ConflictError = z.infer<typeof ConflictErrorSchema>;
