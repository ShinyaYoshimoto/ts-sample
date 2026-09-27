import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import {
	ConflictErrorSchema,
	RegisterUserRequestSchema,
	type User,
	UserSchema,
	ValidationErrorSchema,
} from './schema';

/**
 * POST /users のルート定義
 *
 * REST では成功・失敗を HTTP ステータスコードで表す。
 * レスポンスごとにステータスとボディのスキーマを宣言しておくと、
 * OpenAPI ドキュメントとクライアントの型の両方に反映される。
 */
const registerUserRoute = createRoute({
	method: 'post',
	path: '/users',
	request: {
		body: {
			content: { 'application/json': { schema: RegisterUserRequestSchema } },
			required: true,
		},
	},
	responses: {
		201: {
			description: '登録成功',
			content: { 'application/json': { schema: UserSchema } },
		},
		400: {
			description: '入力が不正',
			content: { 'application/json': { schema: ValidationErrorSchema } },
		},
		409: {
			description: '登録済みのメールアドレス',
			content: { 'application/json': { schema: ConflictErrorSchema } },
		},
	},
});

/**
 * アプリケーションを作る。テストごとに独立したストアを使えるよう、ストアを引数で受け取る。
 */
export function createApp(users: Map<string, User> = new Map()) {
	const app = new OpenAPIHono({
		// zod の検証に失敗したら、400 と ValidationError のボディを返す
		defaultHook: (result, c) => {
			if (!result.success) {
				const issue = result.error.issues[0];
				return c.json(
					{
						type: 'VALIDATION_ERROR' as const,
						message: issue?.message ?? 'Invalid request',
						field: issue?.path[0]?.toString(),
					},
					400,
				);
			}
		},
	});

	const routes = app.openapi(registerUserRoute, (c) => {
		const { email, name } = c.req.valid('json');

		if (users.has(email)) {
			return c.json(
				{
					type: 'DUPLICATE_EMAIL' as const,
					message: 'User with this email already exists',
					email,
				},
				409,
			);
		}

		const user: User = { id: `user-${users.size + 1}`, email, name };
		users.set(email, user);
		return c.json(user, 201);
	});

	// OpenAPI ドキュメント（ルート定義から自動生成）
	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info: { title: 'User API', version: '1.0.0' },
	});

	return routes;
}

/** クライアントが import する型（tRPC の AppRouter に相当） */
export type AppType = ReturnType<typeof createApp>;
