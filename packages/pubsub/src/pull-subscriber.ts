import type { Message, Subscription } from '@google-cloud/pubsub';
import {
	type Handler,
	type Logger,
	processMessage,
} from './consumers/process-message';

/**
 * Pull 型の購読を始める
 *
 * クライアントライブラリがストリーミングでメッセージを取りに行き、'message' イベントで渡してくる。
 * 処理中は確認期限（ack deadline）を自動で延長してくれるので、長い処理でも再配信されにくい。
 * 同時に処理する数は、subscription の flowControl（maxMessages など）で絞れる。
 */
export function startPullSubscriber(
	subscription: Subscription,
	handler: Handler,
	options: { logger?: Logger } = {},
) {
	subscription.on('message', async (message: Message) => {
		const outcome = await processMessage(message.data, handler, {
			messageId: message.id,
			deliveryAttempt: message.deliveryAttempt,
			logger: options.logger,
		});
		if (outcome === 'ack') message.ack();
		else message.nack();
	});
	subscription.on('error', (error) => {
		(options.logger ?? console).error('Subscription error', {
			error: String(error),
		});
	});

	return { close: () => subscription.close() };
}
