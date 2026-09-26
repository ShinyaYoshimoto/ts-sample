import type { GetAccountBalanceQuery } from '../../port/in/getAccountBalanceQuery';
import type { GetAccountBalanceUseCase } from '../../port/in/getAccountBalanceUseCase';
import type { LoadAccountPort } from '../../port/out/loadAccountPort';
import type { Money } from '../model/money';

export class GetAccountBalanceService implements GetAccountBalanceUseCase {
	constructor(private readonly loadAccountPort: LoadAccountPort) {}

	getAccountBalance(query: GetAccountBalanceQuery): Money {
		const account = this.loadAccountPort.loadAccount(
			query.accountId,
			new Date(),
		);
		return account.calculateBalance();
	}
}
