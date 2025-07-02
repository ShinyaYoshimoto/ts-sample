import { Member } from './member';
import { Order } from './order';
import { ScheduledPayment } from './scheduledPayment';

describe('ScheduledPayment', () => {
  const member = new Member(1, 'John Doe');

  it('should create a scheduled payment', () => {
    const order = new Order(
      1,
      member,
      new Date('2021-01-01'),
      new Date('2021-01-01'),
    );
    const scheduledPayment = new ScheduledPayment(
      1,
      order,
      new Date('2021-01-01'),
      new Date('2021-01-01'),
    );
    expect(scheduledPayment).toBeDefined();
  });

  describe('should not create a scheduled payment', () => {
    it('when id is negative', () => {
      const order = new Order(
        1,
        member,
        new Date('2021-01-01'),
        new Date('2021-01-01'),
      );
      expect(
        () =>
          new ScheduledPayment(
            -1,
            order,
            new Date('2021-01-01'),
            new Date('2021-01-01'),
          ),
      ).toThrow();
    });

    it('when order is not confirmed', () => {
      const order = new Order(1, member, new Date('2021-01-01'));
      expect(
        () =>
          new ScheduledPayment(
            1,
            order,
            new Date('2021-01-01'),
            new Date('2021-01-01'),
          ),
      ).toThrow();
    });
  });
});
