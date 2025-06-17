import { Account } from '../../../application/domain/model/account';
import type { Activity } from '../../../application/domain/model/activity';
import { ActivityWindow } from '../../../application/domain/model/activityWindow';
import { Money } from '../../../application/domain/model/money';
import type { LoadAccountPort } from '../../../application/port/out/loadAccountPort';
import type { UpdateAccountStatePort } from '../../../application/port/out/updateAccountStatePort';

export class AccountPersistenceAdapter
	implements UpdateAccountStatePort, LoadAccountPort
{
	constructor() {}

	loadAccount(accountId: string): Account {
		// TODO: data fetch
		return new Account(accountId, new Money(0), new ActivityWindow());
	}

	updateAccountState(accountId: string, activities: Activity[]): boolean {
		// TODO: 永続化
		return true;
	}
}
