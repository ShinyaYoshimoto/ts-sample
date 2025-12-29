import type { Activity } from './activity';
import { Money } from './money';

export class ActivityWindow {
	private activities: Activity[] = [];

	constructor() {}

	public calculateBalance(accountId: string): Money {
		// TODO
		return new Money(100);
	}

	public addActivity(activity: Activity) {
		this.activities.push(activity);
	}
}
