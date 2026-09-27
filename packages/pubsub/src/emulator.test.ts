/**
 * 結合テスト（Pub/Sub エミュレーターが必要）
 *
 *   docker compose up -d pubsub-emulator
 *   PUBSUB_EMULATOR_HOST=localhost:8085 pnpm test
 *
 * PUBSUB_EMULATOR_HOST が未設定なら、このファイルのテストはスキップされる。
 * Push 型のテストでは、テスト中に起動した HTTP サーバーへエミュレーターから配信させる。
 * エミュレーターを docker compose（ブリッジネットワーク）で動かす場合は、
 * PUBSUB_PUSH_HOST=host.docker.internal を指定してホスト側に届くようにする。
 * テストごとに名前の先頭を変えたトピック・サブスクリプションを作るので、互いに干渉しない。
 */
import type { AddressInfo } from 'node:net';
import { type Message, PubSub } from '@google-cloud/pubsub';
import { serve } from '@hono/node-server';
import { createUserService } from '@ts-sample/user-domain';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { resourceNames } from './config';
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
import { createUserRegisteredEvent } from './events';
import { publishEvent, registerUserAndPublish } from './publisher';
import { startPullSubscriber } from './pull-subscriber';
import { createPushApp } from './push-app';
import { MAX_DELIVERY_ATTEMPTS, ensureTopology } from './topology';

const emulatorHost = process.env.PUBSUB_EMULATOR_HOST;
const pushHost = process.env.PUBSUB_PUSH_HOST ?? 'localhost';
const pubsub = new PubSub({ projectId: 'demo-project' });
const closers: (() => Promise<unknown>)[] = [];
let seq = 0;

const silentLogger = (): Logger => ({
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
});
const user = { id: 'user-1', email: 'alice@example.com', name: 'Alice' };

async function setup(options: { pushEndpoint?: string } = {}) {
	const names = resourceNames(`test-${Date.now()}-${seq++}-`);
	return ensureTopology(pubsub, names, options);
}

/** 条件を満たすまで待つ（Pub/Sub の配信は非同期なので） */
async function waitFor(condition: () => boolean, timeoutMs = 15_000) {
	const start = Date.now();
	while (!condition()) {
		if (Date.now() - start > timeoutMs)
			throw new Error('Timed out waiting for condition');
		await new Promise((r) => setTimeout(r, 100));
	}
}

/** 指定時間、何も起きないことを確かめるための待機 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function welcomeMail(logger = silentLogger()) {
	const mailer = new FakeMailer();
	const handler = createWelcomeMailHandler({
		mailer,
		processed: new InMemoryProcessedEventStore(),
	});
	return { mailer, handler, logger };
}

afterAll(async () => {
	await Promise.all(closers.map((close) => close()));
	await pubsub.close();
});

describe.skipIf(!emulatorHost)('Pub/Sub エミュレーター', () => {
	describe('Pull 型（ウェルカムメール）', () => {
		it('ユーザーを登録するとイベントが発行され、メールが1通送られる', async () => {
			const { topic, welcomeMail: subscription } = await setup();
			const { mailer, handler, logger } = welcomeMail();
			closers.push(
				startPullSubscriber(subscription, handler, { logger }).close,
			);

			const result = await registerUserAndPublish(createUserService(), topic, {
				email: 'alice@example.com',
				name: 'Alice',
			});

			expect(result.ok).toBe(true);
			await waitFor(() => mailer.sent.length === 1);
			expect(mailer.sent[0]).toMatchObject({ to: 'alice@example.com' });
		});

		it('登録が失敗したら（業務エラー）イベントは発行されない', async () => {
			const { topic } = await setup();
			const publish = vi.spyOn(topic, 'publishMessage');

			const result = await registerUserAndPublish(createUserService(), topic, {
				email: 'invalid',
				name: 'Alice',
			});

			expect(result).toMatchObject({
				ok: false,
				error: { code: 'VALIDATION_ERROR' },
			});
			expect(publish).not.toHaveBeenCalled();
		});

		it('同じイベントが2回届いても（少なくとも1回の配信）、メールは1通だけ', async () => {
			const { topic, welcomeMail: subscription } = await setup();
			const { mailer, handler, logger } = welcomeMail();
			closers.push(
				startPullSubscriber(subscription, handler, { logger }).close,
			);

			const event = createUserRegisteredEvent(user);
			await publishEvent(topic, event);
			await publishEvent(topic, event); // 発行側のリトライなどで同じイベントが再送された想定

			await waitFor(
				() => (logger.info as ReturnType<typeof vi.fn>).mock.calls.length === 2,
			);
			expect(mailer.sent).toHaveLength(1);
		});

		it('処理が一時的に失敗したら nack し、再配信で成功する', async () => {
			const { topic, welcomeMail: subscription } = await setup();
			const { mailer, handler, logger } = welcomeMail();
			vi.spyOn(mailer, 'send').mockRejectedValueOnce(new Error('SMTP timeout'));
			const attempts: (number | undefined)[] = [];
			closers.push(
				startPullSubscriber(
					subscription,
					async (event) => {
						attempts.push(attempts.length + 1);
						return handler(event);
					},
					{ logger },
				).close,
			);

			await publishEvent(topic, createUserRegisteredEvent(user));

			await waitFor(() => mailer.sent.length === 1);
			expect(attempts).toEqual([1, 2]);
		});

		it(`処理が ${MAX_DELIVERY_ATTEMPTS} 回失敗したら、Dead Letter トピックに移る`, async () => {
			const { topic, welcomeMail: subscription, deadLetter } = await setup();
			let attempts = 0;
			closers.push(
				startPullSubscriber(
					subscription,
					async () => {
						attempts++;
						throw new Error('always fails');
					},
					{ logger: silentLogger() },
				).close,
			);
			const deadLettered: Message[] = [];
			deadLetter.on('message', (message: Message) => {
				deadLettered.push(message);
				message.ack();
			});
			closers.push(() => deadLetter.close());

			const event = createUserRegisteredEvent(user);
			await publishEvent(topic, event);

			await waitFor(() => deadLettered.length === 1, 30_000);
			expect(attempts).toBe(MAX_DELIVERY_ATTEMPTS);
			expect(JSON.parse(deadLettered[0].data.toString())).toEqual(event);
			expect(deadLettered[0].attributes).toMatchObject({
				eventType: 'UserRegistered',
				CloudPubSubDeadLetterSourceDeliveryCount: String(MAX_DELIVERY_ATTEMPTS),
			});
		}, 40_000);

		it('本文が不正なメッセージは ack して捨て、再配信も Dead Letter にもならない', async () => {
			const { topic, welcomeMail: subscription, deadLetter } = await setup();
			const handler = vi.fn();
			const logger = silentLogger();
			closers.push(
				startPullSubscriber(subscription, handler, { logger }).close,
			);
			const deadLettered: Message[] = [];
			deadLetter.on('message', (message: Message) =>
				deadLettered.push(message),
			);
			closers.push(() => deadLetter.close());

			await topic.publishMessage({ data: Buffer.from('not json') });

			await waitFor(
				() => (logger.warn as ReturnType<typeof vi.fn>).mock.calls.length === 1,
			);
			await sleep(3_000);
			expect(logger.warn).toHaveBeenCalledTimes(1);
			expect(handler).not.toHaveBeenCalled();
			expect(deadLettered).toHaveLength(0);
		});
	});

	describe('Push 型（検索インデックス）', () => {
		async function startPushServer(
			handler: Parameters<typeof createPushApp>[0],
		) {
			const app = createPushApp(handler, { logger: silentLogger() });
			const server = serve({ fetch: app.fetch, port: 0 });
			await new Promise((resolve) => server.once('listening', resolve));
			closers.push(() => new Promise((resolve) => server.close(resolve)));
			return `http://${pushHost}:${(server.address() as AddressInfo).port}/pubsub/push`;
		}

		it('Pub/Sub が HTTP エンドポイントに POST し、インデックスが更新される', async () => {
			const index = new InMemorySearchIndex();
			const pushEndpoint = await startPushServer(
				createSearchIndexHandler({ index }),
			);
			const { topic } = await setup({ pushEndpoint });

			await publishEvent(topic, createUserRegisteredEvent(user));

			await waitFor(() => index.documents.size === 1);
			expect(index.documents.get('user-1')).toEqual(user);
		});

		it('500 を返すと再配信され、次の配信で成功する', async () => {
			const index = new InMemorySearchIndex();
			const handler = createSearchIndexHandler({ index });
			let attempts = 0;
			const pushEndpoint = await startPushServer(async (event) => {
				attempts++;
				if (attempts === 1) throw new Error('index is temporarily unavailable');
				return handler(event);
			});
			const { topic } = await setup({ pushEndpoint });

			await publishEvent(topic, createUserRegisteredEvent(user));

			await waitFor(() => index.documents.size === 1, 30_000);
			expect(attempts).toBe(2);
		}, 40_000);
	});
});
