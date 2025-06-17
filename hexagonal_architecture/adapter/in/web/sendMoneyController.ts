import { Money } from '../../../application/domain/model/money';
import { GetAccountBalanceQuery } from '../../../application/port/in/getAccountBalanceQuery';
import type { GetAccountBalanceUseCase } from '../../../application/port/in/getAccountBalanceUseCase';
import { SendMoneyCommand } from '../../../application/port/in/sendMoneyCommand';
import type { SendMoneyUseCase } from '../../../application/port/in/sendMoneyUseCase';

export class SendMoneyController {
	constructor(
		private readonly sendMoneyUsecase: SendMoneyUseCase,
		private readonly getAccountBalanceUsecase: GetAccountBalanceUseCase,
	) {}

	handle(request: SendMoneyRequest): SendMoneyResponse {
		const { sourceAccountId, targetAccountId, amount } = request;

		const command = new SendMoneyCommand(
			sourceAccountId,
			targetAccountId,
			new Money(amount),
		);

		const success = this.sendMoneyUsecase.sendMoney(command);

		if (!success) {
			return { success: false };
		}

		const query = new GetAccountBalanceQuery(sourceAccountId);

		const balance = this.getAccountBalanceUsecase.getAccountBalance(query);

		return { success, balance: balance.amount };
	}
}

type SendMoneyRequest = {
	sourceAccountId: string;
	targetAccountId: string;
	amount: number;
};

type SendMoneyResponse = {
	success: boolean;
	balance?: number;
};
