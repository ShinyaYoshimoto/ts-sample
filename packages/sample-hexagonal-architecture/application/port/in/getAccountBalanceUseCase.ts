import type { Money } from '../../domain/model/money';
import type { GetAccountBalanceQuery } from './getAccountBalanceQuery';

export interface GetAccountBalanceUseCase {
	getAccountBalance(query: GetAccountBalanceQuery): Money;
}
