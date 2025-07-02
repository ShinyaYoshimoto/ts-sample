import { Administrator } from './administrator';
import { Order } from './order';

export class OrderConfirmation {
  constructor(
    public readonly id: number,
    public readonly order: Order,
    public readonly administrator: Administrator,
    public readonly confirmedAt: Date,
  ) {
    if (!id || id < 0) {
      throw new Error('id is required');
    }

    if (order.confirmedAt) {
      throw new Error('order is already confirmed');
    }
  }
}
