import type { Money } from '../../domain/model/money';

export class SendMoneyCommand {
	private sourceAccountId: string;
	private targetAccountId: string;
	private money: Money;

	constructor(sourceAccountId: string, targetAccountId: string, money: Money) {
		if (sourceAccountId.length === 0) {
			throw new Error('sourceAccountId is required');
		}

		if (targetAccountId.length === 0) {
			throw new Error('targetAccountId is required');
		}

		if (!money.isPositive()) {
			throw new Error('money amount must be greater than 0');
		}

		this.sourceAccountId = sourceAccountId;
		this.targetAccountId = targetAccountId;
		this.money = money;
	}
}
