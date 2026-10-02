import { randomUUID } from 'node:crypto';
import type { User } from '@ts-sample/user-domain';
import { z } from 'zod';

/**
 * Pub/Sub で流すイベントのスキーマ
 *
 * メッセージの中身はただのバイト列なので、送る側と受ける側で同じスキーマを使って
 * 「送るときに作る」「受けたときに検証する」の両方をこのファイルに寄せる。
 */
export const UserRegisteredEventSchema = z.object({
	/** 冪等性のキー。同じイベントが2回届いても、この ID で重複を判定する */
	eventId: z.string().uuid(),
	eventType: z.literal('UserRegistered'),
	occurredAt: z.string().datetime(),
	data: z.object({
		user: z.object({ id: z.string(), email: z.string(), name: z.string() }),
	}),
});

export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;

export function createUserRegisteredEvent(
	user: User,
	now = new Date(),
): UserRegisteredEvent {
	return {
		eventId: randomUUID(),
		eventType: 'UserRegistered',
		occurredAt: now.toISOString(),
		data: { user: { id: user.id, email: user.email, name: user.name } },
	};
}

export type DecodeResult =
	| { ok: true; event: UserRegisteredEvent }
	| { ok: false; reason: string };

/** メッセージのデータ（バイト列）をイベントに変換する。形が不正なら理由を返す */
export function decodeEvent(data: Buffer | string): DecodeResult {
	let json: unknown;
	try {
		json = JSON.parse(data.toString());
	} catch {
		return { ok: false, reason: 'Message data is not valid JSON' };
	}
	const parsed = UserRegisteredEventSchema.safeParse(json);
	return parsed.success
		? { ok: true, event: parsed.data }
		: {
				ok: false,
				reason: parsed.error.issues
					.map((i) => `${i.path.join('.')}: ${i.message}`)
					.join(', '),
			};
}
