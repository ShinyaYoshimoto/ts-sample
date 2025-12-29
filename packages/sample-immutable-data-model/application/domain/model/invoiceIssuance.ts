import { Order } from './order';

export class InvoiceIssuance {
  constructor(
    public readonly id: number,
    public readonly order: Order,
    public readonly issuedAt: Date,
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

    if (!order.paidAt) {
      throw new Error('Payment is not done');
    }

    if (order.invoiceIssuedAt) {
      throw new Error('Invoice is already issued');
    }
  }
}
