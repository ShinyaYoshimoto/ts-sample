import { Account } from '../../domain/model/account';

export interface LoadAccountPort {
  loadAccount(accountId: string, time: Date): Account;
}
