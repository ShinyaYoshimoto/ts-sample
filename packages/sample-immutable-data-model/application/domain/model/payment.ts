import { Order } from './order';

export class Payment {
  constructor(
    public readonly id: number,
    public readonly order: Order,
    public readonly paidAt: Date,
  ) {
    if (!id || id < 0) {
      throw new Error('id is required');
    }

    if (!order.confirmedAt) {
      throw new Error('Order is not confirmed');
    }

    if (!order.paymentScheduleAt) {
      throw new Error('Payment schedule is not set');
    }

    if (order.paidAt) {
      throw new Error('Payment is already done');
    }
  }
}
