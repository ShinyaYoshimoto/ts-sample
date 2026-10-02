import type { UserRegisteredEvent } from '../events';

export interface Mailer {
	/**
	 * idempotencyKey が同じ送信は1通にまとめてくれる前提
	 * （多くのメール送信 API が冪等キーを受け付ける）
	 */
	send(mail: {
		to: string;
		subject: string;
		body: string;
		idempotencyKey: string;
	}): Promise<void>;
}

/**
 * 処理済みイベントの記録
 *
 * Pub/Sub は「少なくとも1回」配信なので、同じイベントが複数回届くことがある。
 * 処理を始める前に eventId のリース（期限付きの処理権）を取り、終わったら処理済みにする。
 * - 処理済み、または他の配信がリース中なら読み飛ばす
 * - 処理中にワーカーが落ちても、リースが切れれば再配信で処理し直せる（永久に予約したままにしない）
 * 本番ではこの記録を DB（行ロックや条件付き更新）や Firestore（トランザクション）で行い、複数インスタンス間でも原子的にする。
 */
export interface ProcessedEventStore {
	/** 未処理で、かつ有効なリースがなければリースを取って true。処理済み・リース中なら false */
	tryAcquire(eventId: string, leaseMs: number): Promise<boolean>;
	/** 処理が終わったら処理済みにする（以降の配信は読み飛ばす） */
	markDone(eventId: string): Promise<void>;
	/** 処理に失敗したらリースを手放す（再配信ですぐ再挑戦できるように） */
	release(eventId: string): Promise<void>;
}

type EventState =
	| { status: 'processing'; leaseUntil: number }
	| { status: 'done' };

export class InMemoryProcessedEventStore implements ProcessedEventStore {
	private readonly states = new Map<string, EventState>();
	constructor(private readonly now: () => number = Date.now) {}

	async tryAcquire(eventId: string, leaseMs: number) {
		const state = this.states.get(eventId);
		if (state?.status === 'done') return false;
		if (state?.status === 'processing' && state.leaseUntil > this.now())
			return false;
		this.states.set(eventId, {
			status: 'processing',
			leaseUntil: this.now() + leaseMs,
		});
		return true;
	}
	async markDone(eventId: string) {
		this.states.set(eventId, { status: 'done' });
	}
	async release(eventId: string) {
		this.states.delete(eventId);
	}
}

/** idempotencyKey ごとに1通だけ送ったことにするメール送信のフェイク */
export class FakeMailer implements Mailer {
	readonly sent: Parameters<Mailer['send']>[0][] = [];
	async send(mail: Parameters<Mailer['send']>[0]) {
		if (this.sent.some((m) => m.idempotencyKey === mail.idempotencyKey)) return;
		this.sent.push(mail);
	}
}

export type HandleResult = 'processed' | 'duplicate';

/** リースの長さ。メール送信にかかる時間より十分長くする */
export const DEFAULT_LEASE_MS = 60_000;

/**
 * ウェルカムメールを送るハンドラー（副作用があるので eventId で重複を排除する）
 *
 * 重複排除は2段構え:
 * 1. ProcessedEventStore で、処理済み・処理中の配信を読み飛ばす
 * 2. 送信後・処理済みにする前に落ちた場合は再送になるので、eventId を冪等キーとしてメール送信 API に渡す
 *
 * 例外を投げたら「一時的な失敗」として扱い、呼び出し側が nack / 500 を返して再配信させる。
 */
export function createWelcomeMailHandler(deps: {
	mailer: Mailer;
	processed: ProcessedEventStore;
	leaseMs?: number;
}) {
	const leaseMs = deps.leaseMs ?? DEFAULT_LEASE_MS;
	return async (event: UserRegisteredEvent): Promise<HandleResult> => {
		if (!(await deps.processed.tryAcquire(event.eventId, leaseMs)))
			return 'duplicate';
		try {
			const { user } = event.data;
			await deps.mailer.send({
				to: user.email,
				subject: 'ようこそ',
				body: `${user.name} さん、登録ありがとうございます。`,
				idempotencyKey: event.eventId,
			});
		} catch (error) {
			await deps.processed.release(event.eventId);
			throw error;
		}
		await deps.processed.markDone(event.eventId);
		return 'processed';
	};
}
