import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { type UserService, createUserService } from '@ts-sample/user-domain';
import {
	EmailAlreadyExistsErrorSchema,
	RegisterUserRequestSchema,
	UserIdParamSchema,
	UserNotFoundErrorSchema,
	UserSchema,
	ValidationErrorSchema,
} from './schema';

/**
 * REST では成功・失敗を HTTP ステータスコードで表す。
 * レスポンスごとにステータスとボディのスキーマを宣言しておくと、
 * OpenAPI ドキュメントとクライアントの型の両方に反映される。
 */

/** コマンド: POST /users */
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
			content: {
				'application/json': { schema: EmailAlreadyExistsErrorSchema },
			},
		},
	},
});

/** クエリ: GET /users/{id} */
const getUserRoute = createRoute({
	method: 'get',
	path: '/users/{id}',
	request: { params: UserIdParamSchema },
	responses: {
		200: {
			description: '取得成功',
			content: { 'application/json': { schema: UserSchema } },
		},
		404: {
			description: 'ユーザーが存在しない',
			content: { 'application/json': { schema: UserNotFoundErrorSchema } },
		},
	},
});

export function createApp(service: UserService = createUserService()) {
	const app = new OpenAPIHono({
		// リクエストの形が不正（文字列でないなど）なら、400 と ValidationError のボディを返す
		defaultHook: (result, c) => {
			if (!result.success) {
				const field =
					result.error.issues[0]?.path[0] === 'name' ? 'name' : 'email';
				return c.json(
					{
						code: 'VALIDATION_ERROR' as const,
						field,
						message: result.error.issues[0]?.message ?? 'Invalid request',
					},
					400,
				);
			}
		},
	});

	const routes = app
		.openapi(registerUserRoute, (c) => {
			const result = service.registerUser(c.req.valid('json'));
			if (result.ok) {
				return c.json(result.value, 201);
			}
			// エラーの種類ごとに HTTP ステータスへ変換する
			switch (result.error.code) {
				case 'VALIDATION_ERROR':
					return c.json(result.error, 400);
				case 'EMAIL_ALREADY_EXISTS':
					return c.json(result.error, 409);
			}
		})
		.openapi(getUserRoute, (c) => {
			const result = service.getUser(c.req.valid('param').id);
			return result.ok ? c.json(result.value, 200) : c.json(result.error, 404);
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
