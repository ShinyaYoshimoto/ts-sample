import { Money } from "./money";

describe("Money", () => {
  it("should be created", () => {
    const money = new Money(0);
    expect(money).toBeDefined();
  });

  it("should be added", () => {
    const money = new Money(0);
    const added = Money.add(money, new Money(100));
    expect(added.amount).toBe(100);
  });

  it("should be negated", () => {
    const money = new Money(100);
    const negated = money.negate();
    expect(negated.amount).toBe(-100);
  });

  it("should be positive", () => {
    const money = new Money(100);
    const isPositive = money.isPositive();
    expect(isPositive).toBe(true);
  });

  it("should be negative", () => {
    const money = new Money(-100);
    const isPositive = money.isPositive();
    expect(isPositive).toBe(false);
  });
});
