import { Money } from '../../domain/model/money';
import { GetAccountBalanceQuery } from './getAccountBalanceQuery';

export interface GetAccountBalanceUseCase {
  getAccountBalance(query: GetAccountBalanceQuery): Money;
}
