import { Order } from './order';

export class CanceledOrder {
  constructor(
    readonly order: Order,
    readonly canceledAt: Date,
  ) {}
}
