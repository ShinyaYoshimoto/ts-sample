import { Hono } from 'hono';
import { z } from 'zod';
import {
	type Handler,
	type Logger,
	processMessage,
} from './consumers/process-message';

/**
 * Push 型サブスクリプションが POST してくるリクエストボディ
 * https://cloud.google.com/pubsub/docs/push
 */
export const PushEnvelopeSchema = z.object({
	message: z.object({
		/**
		 * Base64 でエンコードされたメッセージ本文。
		 * 属性だけのメッセージでは省略されるので、空として受け取り「不正なメッセージ」として ack する
		 * （400 を返すと再配信され続けてしまう）
		 */
		data: z.string().default(''),
		messageId: z.string(),
		attributes: z.record(z.string()).optional(),
		publishTime: z.string().optional(),
	}),
	subscription: z.string(),
	/** Dead Letter ポリシーがあるサブスクリプションでのみ付く */
	deliveryAttempt: z.number().optional(),
});

/**
 * Push 型の購読を受ける HTTP アプリ（Cloud Run などにそのままデプロイできる形）
 *
 * Push 型では、2xx を返すと ack、それ以外（または期限内に応答しない）と nack として扱われ、
 * Pub/Sub が間隔を空けて再配信する。
 * 本物の GCP では、Cloud Run 側で認証を必須にし、Push サブスクリプションに OIDC トークンを付けさせることで、
 * Pub/Sub 以外からのリクエストを弾く（README 参照）。
 */
export function createPushApp(
	handler: Handler,
	options: { logger?: Logger } = {},
) {
	const app = new Hono();

	app.get('/healthz', (c) => c.text('ok'));

	app.post('/pubsub/push', async (c) => {
		const parsed = PushEnvelopeSchema.safeParse(
			await c.req.json().catch(() => undefined),
		);
		if (!parsed.success) {
			// Pub/Sub からのリクエストではない
			return c.json({ error: 'Invalid push envelope' }, 400);
		}

		const { message, deliveryAttempt } = parsed.data;
		const outcome = await processMessage(
			Buffer.from(message.data, 'base64'),
			handler,
			{
				messageId: message.messageId,
				deliveryAttempt,
				logger: options.logger,
			},
		);
		return outcome === 'ack' ? c.body(null, 204) : c.body(null, 500);
	});

	return app;
}
