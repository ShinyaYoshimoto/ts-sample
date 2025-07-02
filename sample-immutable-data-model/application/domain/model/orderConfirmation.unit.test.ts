import { Administrator } from './administrator';
import { Member } from './member';
import { Order } from './order';
import { OrderConfirmation } from './orderConfirmation';

describe('OrderConfirmation', () => {
  it('should be created', () => {
    const member = new Member(1, 'John Doe');
    const order = new Order(1, member, new Date());
    const administrator = new Administrator(1, 'John Doe');
    const orderConfirmation = new OrderConfirmation(
      1,
      order,
      administrator,
      new Date(),
    );
    expect(orderConfirmation).toBeDefined();
  });

  describe('should not be created', () => {
    it('when orderId is negative', () => {
      expect(
        () =>
          new OrderConfirmation(
            -1,
            new Order(1, new Member(1, 'John Doe'), new Date()),
            new Administrator(1, 'John Doe'),
            new Date(),
          ),
      ).toThrow();
    });

    it('when order is already confirmed', () => {
      const order = new Order(
        1,
        new Member(1, 'John Doe'),
        new Date(),
        new Date(),
      );
      expect(
        () =>
          new OrderConfirmation(
            1,
            order,
            new Administrator(1, 'John Doe'),
            new Date(),
          ),
      ).toThrow();
    });
  });
});
