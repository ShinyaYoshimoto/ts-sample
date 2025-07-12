import { Member } from './member';
import { Order } from './order';
import { Payment } from './payment';

describe('Payment', () => {
  it('should create a payment', () => {
    const member = new Member(1, 'John Doe');
    const order = new Order(1, member, new Date('2021-01-01'), new Date('2021-01-01'), new Date('2021-01-01'));

    const payment = new Payment(1, order, new Date('2021-01-01'));
    expect(payment).toBeDefined();
  });

  describe('should not be created', () => {
    it('when id is negative', () => {
      const member = new Member(1, 'John Doe');
      const order = new Order(1, member, new Date('2021-01-01'));

      expect(() => new Payment(-1, order, new Date('2021-01-01'))).toThrow(
        'id is required',
      );
    });

    it('when order is not confirmed', () => {
      const member = new Member(1, 'John Doe');
      const order = new Order(1, member, new Date('2021-01-01'));

      expect(() => new Payment(1, order, new Date('2021-01-01'))).toThrow(
        'Order is not confirmed',
      );
    });

    it('when payment schedule is not set', () => {
      const member = new Member(1, 'John Doe');
      const order = new Order(1, member, new Date('2021-01-01'), new Date('2021-01-01'));

      expect(() => new Payment(1, order, new Date('2021-01-01'))).toThrow(
        'Payment schedule is not set',
      );
    });

    it('when payment is already done', () => {
      const member = new Member(1, 'John Doe');
      const order = new Order(1, member, new Date('2021-01-01'), new Date('2021-01-01'), new Date('2021-01-01'), new Date('2021-01-01'));

      expect(() => new Payment(1, order, new Date('2021-01-01'))).toThrow(
        'Payment is already done',
      );
    });
  });
});
