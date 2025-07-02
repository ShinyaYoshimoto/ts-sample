import { Order } from './order';

export class ScheduledPayment {
  constructor(
    public readonly id: number,
    public readonly order: Order,
    public readonly scheduledPaymentDate: Date,
    public readonly scheduledPaymentRegisteredAt: Date,
  ) {
    if (!id || id < 0) {
      throw new Error('id is required');
    }
  }
}
