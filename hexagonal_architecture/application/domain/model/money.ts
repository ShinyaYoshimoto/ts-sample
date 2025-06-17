export class Money {
  constructor(readonly amount: number) {}

  public static add(base: Money, added: Money): Money {
    return new Money(base.amount + added.amount);
  }

  public negate(): Money {
    return new Money(-this.amount);
  }

  public isPositive(): boolean {
    return this.amount > 0;
  }
}
