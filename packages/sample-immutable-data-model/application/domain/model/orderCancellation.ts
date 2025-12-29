import { Order } from './order';

export class OrderCancellation {
  constructor(
    public readonly id: number,
    public readonly order: Order,
    public readonly cancelledAt: Date,
  ) {
    if (!id || id < 0) {
      throw new Error('id is required');
    }

    if (order.paymentScheduleAt && order.paymentScheduleAt < new Date()) {
      throw new Error('Payment schedule is in the past');
    }

    if (order.paidAt) {
      throw new Error('Order is paid');
    }

    if (order.invoiceIssuedAt) {
      throw new Error('Order is invoiced');
    }
  }
}
