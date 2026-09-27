import type { UserRegisteredEvent } from '../events';

export interface Mailer {
	send(mail: { to: string; subject: string; body: string }): Promise<void>;
}

/**
 * 処理済みイベントの記録
 *
 * Pub/Sub は「少なくとも1回」配信なので、同じイベントが複数回届くことがある。
 * 処理を始める前に eventId を予約し、重複した配信を読み飛ばす。
 * 本番ではこの記録を DB（一意制約）や Firestore（create の失敗）で行い、複数インスタンス間でも原子的にする。
 */
export interface ProcessedEventStore {
	/** 未処理なら予約して true、処理中・処理済みなら false */
	tryReserve(eventId: string): Promise<boolean>;
	/** 処理に失敗したら予約を取り消す（再配信で再挑戦できるように） */
	release(eventId: string): Promise<void>;
}

export class InMemoryProcessedEventStore implements ProcessedEventStore {
	private readonly reserved = new Set<string>();
	async tryReserve(eventId: string) {
		if (this.reserved.has(eventId)) return false;
		this.reserved.add(eventId);
		return true;
	}
	async release(eventId: string) {
		this.reserved.delete(eventId);
	}
}

export class FakeMailer implements Mailer {
	readonly sent: { to: string; subject: string; body: string }[] = [];
	async send(mail: { to: string; subject: string; body: string }) {
		this.sent.push(mail);
	}
}

export type HandleResult = 'processed' | 'duplicate';

/**
 * ウェルカムメールを送るハンドラー（副作用があるので eventId で重複を排除する）
 *
 * 例外を投げたら「一時的な失敗」として扱い、呼び出し側が nack / 500 を返して再配信させる。
 */
export function createWelcomeMailHandler(deps: {
	mailer: Mailer;
	processed: ProcessedEventStore;
}) {
	return async (event: UserRegisteredEvent): Promise<HandleResult> => {
		if (!(await deps.processed.tryReserve(event.eventId))) return 'duplicate';
		try {
			const { user } = event.data;
			await deps.mailer.send({
				to: user.email,
				subject: 'ようこそ',
				body: `${user.name} さん、登録ありがとうございます。`,
			});
			return 'processed';
		} catch (error) {
			await deps.processed.release(event.eventId);
			throw error;
		}
	};
}
