/**
 * 単体テスト（エミュレーター不要）
 * イベントの検証、冪等なハンドラー、Push 型の HTTP アプリの応答を確かめる。
 */
import { describe, expect, it, vi } from 'vitest';
import type { Logger } from './consumers/process-message';
import {
	InMemorySearchIndex,
	createSearchIndexHandler,
} from './consumers/search-index';
import {
	FakeMailer,
	InMemoryProcessedEventStore,
	createWelcomeMailHandler,
} from './consumers/welcome-mail';
import { createUserRegisteredEvent, decodeEvent } from './events';
import { createPushApp } from './push-app';

const user = { id: 'user-1', email: 'alice@example.com', name: 'Alice' };
const silentLogger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

describe('decodeEvent', () => {
	it('作ったイベントを JSON にして戻すと、同じイベントになる', () => {
		const event = createUserRegisteredEvent(user);
		expect(decodeEvent(Buffer.from(JSON.stringify(event)))).toEqual({
			ok: true,
			event,
		});
	});

	it('JSON でない・スキーマに合わないメッセージは理由付きで弾く', () => {
		expect(decodeEvent('not json')).toEqual({
			ok: false,
			reason: 'Message data is not valid JSON',
		});
		const result = decodeEvent(JSON.stringify({ eventType: 'UserRegistered' }));
		expect(result.ok).toBe(false);
	});
});

describe('ウェルカムメール（eventId で重複を排除）', () => {
	it('同じイベントが2回届いても、メールは1通だけ送る', async () => {
		const mailer = new FakeMailer();
		const handle = createWelcomeMailHandler({
			mailer,
			processed: new InMemoryProcessedEventStore(),
		});
		const event = createUserRegisteredEvent(user);

		expect(await handle(event)).toBe('processed');
		expect(await handle(event)).toBe('duplicate');
		expect(mailer.sent).toHaveLength(1);
	});

	it('送信に失敗したら予約を取り消し、再配信で送り直せる', async () => {
		const mailer = new FakeMailer();
		const send = vi
			.spyOn(mailer, 'send')
			.mockRejectedValueOnce(new Error('SMTP timeout'));
		const handle = createWelcomeMailHandler({
			mailer,
			processed: new InMemoryProcessedEventStore(),
		});
		const event = createUserRegisteredEvent(user);

		await expect(handle(event)).rejects.toThrow('SMTP timeout');
		expect(await handle(event)).toBe('processed');
		expect(send).toHaveBeenCalledTimes(2);
	});
});

describe('検索インデックス（upsert なので処理自体が冪等）', () => {
	it('同じイベントを何度処理しても結果は変わらない', async () => {
		const index = new InMemorySearchIndex();
		const handle = createSearchIndexHandler({ index });
		const event = createUserRegisteredEvent(user);

		await handle(event);
		await handle(event);
		expect([...index.documents.values()]).toEqual([user]);
	});
});

describe('Push 型の HTTP アプリ', () => {
	const envelope = (data: string) => ({
		message: { data: Buffer.from(data).toString('base64'), messageId: '1' },
		subscription: 'projects/demo-project/subscriptions/search-index',
	});
	const post = (app: ReturnType<typeof createPushApp>, body: unknown) =>
		app.request('/pubsub/push', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		});

	it('処理に成功したら 204（ack）を返す', async () => {
		const handler = vi.fn().mockResolvedValue('processed');
		const app = createPushApp(handler, { logger: silentLogger });
		const event = createUserRegisteredEvent(user);

		const res = await post(app, envelope(JSON.stringify(event)));
		expect(res.status).toBe(204);
		expect(handler).toHaveBeenCalledWith(event);
	});

	it('処理が失敗したら 500（nack）を返し、Pub/Sub に再配信させる', async () => {
		const app = createPushApp(vi.fn().mockRejectedValue(new Error('down')), {
			logger: silentLogger,
		});
		const res = await post(
			app,
			envelope(JSON.stringify(createUserRegisteredEvent(user))),
		);
		expect(res.status).toBe(500);
	});

	it('本文が不正なメッセージは 204（ack）で捨てる（再配信しても直らないため）', async () => {
		const handler = vi.fn();
		const app = createPushApp(handler, { logger: silentLogger });
		const res = await post(app, envelope('not json'));
		expect(res.status).toBe(204);
		expect(handler).not.toHaveBeenCalled();
	});

	it('Pub/Sub の形式でないリクエストは 400 を返す', async () => {
		const res = await post(createPushApp(vi.fn(), { logger: silentLogger }), {
			foo: 'bar',
		});
		expect(res.status).toBe(400);
	});
});
