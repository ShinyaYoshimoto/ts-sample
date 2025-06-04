import { Money } from "./money";

export class Activity {
  public readonly accountId: string;
  public readonly targetAccountId: string;
  public readonly amount: Money;
  public readonly timestamp: Date;

  constructor(
    param: {
      accountId: string,
      targetAccountId: string,
      amount: Money,
      timestamp: Date
    }
  ) {
    this.accountId = param.accountId;
    this.targetAccountId = param.targetAccountId;
    this.amount = param.amount;
    this.timestamp = param.timestamp;
  }
}