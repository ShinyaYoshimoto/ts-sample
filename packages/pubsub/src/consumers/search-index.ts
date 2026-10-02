import type { User } from '@ts-sample/user-domain';
import type { UserRegisteredEvent } from '../events';

/** 検索用の読み取りモデル（CQRS の読み取り側）。本番では Elasticsearch などに置き換える */
export interface SearchIndex {
	upsert(user: User): Promise<void>;
}

export class InMemorySearchIndex implements SearchIndex {
	readonly documents = new Map<string, User>();
	async upsert(user: User) {
		this.documents.set(user.id, user);
	}
}

/**
 * 検索インデックスを更新するハンドラー
 *
 * ユーザー ID をキーにした upsert（上書き）なので、同じイベントが何度届いても結果は変わらない。
 * このように処理自体が冪等なら、eventId での重複排除は不要になる。
 */
export function createSearchIndexHandler(deps: { index: SearchIndex }) {
	return async (event: UserRegisteredEvent): Promise<'processed'> => {
		await deps.index.upsert(event.data.user);
		return 'processed';
	};
}
