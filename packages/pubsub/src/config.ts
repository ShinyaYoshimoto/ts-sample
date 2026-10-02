import topology from './topology.json';

/**
 * 環境変数から読み込む設定
 *
 * - PUBSUB_EMULATOR_HOST: 設定されていると @google-cloud/pubsub が自動でエミュレーターに接続する
 *   （未設定なら本物の Pub/Sub に、Application Default Credentials で接続する）
 * - PUBSUB_PROJECT_ID: プロジェクト ID（エミュレーターでは任意の文字列でよい）
 * - PUSH_ENDPOINT: Push 型サブスクリプションの配信先 URL（setup:topology で使う）
 * - PUSH_AUTH_SERVICE_ACCOUNT: Push 時に OIDC トークンを付けるサービスアカウント（本物の GCP で Cloud Run の認証を通すため）
 */
export const config = {
	projectId:
		process.env.PUBSUB_PROJECT_ID ??
		process.env.GOOGLE_CLOUD_PROJECT ??
		'demo-project',
	pushEndpoint: process.env.PUSH_ENDPOINT,
	pushAuthServiceAccount: process.env.PUSH_AUTH_SERVICE_ACCOUNT,
	port: Number(process.env.PORT ?? 8080),
};

/**
 * トピックとサブスクリプションの名前（prefix を付けると、テストごとに独立した名前にできる）
 *
 * 名前は topology.json に置き、Terraform（terraform/）からも同じファイルを読む。
 * - topic / deadLetterTopic: イベントのトピックと Dead Letter トピック
 * - welcomeMailSubscription: Pull 型（ウェルカムメール送信）
 * - searchIndexSubscription: Push 型（検索インデックス更新）
 * - deadLetterSubscription: Dead Letter に落ちたメッセージを確認するためのサブスクリプション
 */
export function resourceNames(prefix = '') {
	const { names } = topology;
	return {
		topic: `${prefix}${names.topic}`,
		deadLetterTopic: `${prefix}${names.deadLetterTopic}`,
		welcomeMailSubscription: `${prefix}${names.welcomeMailSubscription}`,
		searchIndexSubscription: `${prefix}${names.searchIndexSubscription}`,
		deadLetterSubscription: `${prefix}${names.deadLetterSubscription}`,
	};
}

export type ResourceNames = ReturnType<typeof resourceNames>;
