import { type UserRegisteredEvent, decodeEvent } from '../events';

export type Handler = (event: UserRegisteredEvent) => Promise<unknown>;

export interface Logger {
	info(message: string, meta?: Record<string, unknown>): void;
	warn(message: string, meta?: Record<string, unknown>): void;
	error(message: string, meta?: Record<string, unknown>): void;
}

export const consoleLogger: Logger = {
	info: (message, meta) => console.log(message, meta ?? ''),
	warn: (message, meta) => console.warn(message, meta ?? ''),
	error: (message, meta) => console.error(message, meta ?? ''),
};

/**
 * 受け取ったメッセージを処理し、ack（完了）か nack（再配信してほしい）かを決める。Pull 型・Push 型で共通。
 *
 * - 成功（重複を読み飛ばした場合も含む）→ ack
 * - 形が不正なメッセージ → ack して記録だけ残す（何度再配信しても直らないため）
 * - ハンドラーが例外を投げた → nack（一時的な失敗とみなして再配信させる。
 *   最大配信回数を超えると Dead Letter トピックに移る）
 */
export async function processMessage(
	data: Buffer | string,
	handler: Handler,
	context: { messageId: string; deliveryAttempt?: number; logger?: Logger },
): Promise<'ack' | 'nack'> {
	const logger = context.logger ?? consoleLogger;
	const meta = {
		messageId: context.messageId,
		deliveryAttempt: context.deliveryAttempt,
	};

	const decoded = decodeEvent(data);
	if (!decoded.ok) {
		logger.warn('Dropped invalid message', { ...meta, reason: decoded.reason });
		return 'ack';
	}

	try {
		const result = await handler(decoded.event);
		logger.info('Processed message', {
			...meta,
			eventId: decoded.event.eventId,
			result,
		});
		return 'ack';
	} catch (error) {
		logger.error('Failed to process message', {
			...meta,
			error: String(error),
		});
		return 'nack';
	}
}
