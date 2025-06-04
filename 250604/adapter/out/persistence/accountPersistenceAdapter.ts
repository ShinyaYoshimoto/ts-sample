import { Activity } from "../../../application/domain/model/activity";
import { UpdateAccountStatePort } from "../../../application/port/out/updateAccountStatePort";
import { LoadAccountPort } from "../../../application/port/out/loadAccountPort";
import { Account } from "../../../application/domain/model/account";
import { Money } from "../../../application/domain/model/money";
import { ActivityWindow } from "../../../application/domain/model/activityWindow";

export class AccountPersistenceAdapter implements UpdateAccountStatePort, LoadAccountPort {
  constructor(
  ) {}

  loadAccount(accountId: string): Account {
    // TODO: data fetch
    return new Account(accountId, new Money(0), new ActivityWindow());
  }

  updateAccountState(accountId: string, activities: Activity[]): boolean {
    // TODO: 永続化
    return true;
  }
}