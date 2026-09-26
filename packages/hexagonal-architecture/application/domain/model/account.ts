import { Activity } from './activity';
import type { ActivityWindow } from './activityWindow';
import { Money } from './money';

export class Account {
	private accountId: string;
	private baselineBalance: Money;
	private activityWindow: ActivityWindow;

	constructor(
		accountId: string,
		baselineBalance: Money,
		activityWindow: ActivityWindow,
	) {
		this.accountId = accountId;
		this.baselineBalance = baselineBalance;
		this.activityWindow = activityWindow;
	}

	public calculateBalance(): Money {
		return Money.add(
			this.baselineBalance,
			this.activityWindow.calculateBalance(this.accountId),
		);
	}

	public withdraw(money: Money, targetAccountId: string): boolean {
		if (!this.mayWithdraw(money)) {
			return false;
		}

		const activity = new Activity({
			accountId: this.accountId,
			targetAccountId: targetAccountId,
			amount: money,
			timestamp: new Date(),
		});
		this.activityWindow.addActivity(activity);
		return true;
	}

	private mayWithdraw(money: Money): boolean {
		return Money.add(this.calculateBalance(), money.negate()).isPositive();
	}

	public deposit(money: Money, sourceAccountId: string): boolean {
		const deposit = new Activity({
			accountId: sourceAccountId,
			targetAccountId: this.accountId,
			amount: money,
			timestamp: new Date(),
		});
		this.activityWindow.addActivity(deposit);
		return true;
	}
}
