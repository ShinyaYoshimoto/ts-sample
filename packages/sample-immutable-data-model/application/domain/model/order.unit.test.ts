import { Member } from './member';
import { Order } from './order';

describe('Order', () => {
  it('should be created', () => {
    const member = new Member(1, 'John Doe');
    const order = new Order(1, member, new Date());
    expect(order).toBeDefined();
  });

  describe('should not be created', () => {
    it('when orderId is negative', () => {
      expect(() => new Order(-1, new Member(1, 'John Doe'), new Date())).toThrow();
    });
  });
});
