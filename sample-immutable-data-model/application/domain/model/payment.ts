import { Order } from './order';

export class Payment {
  constructor(
    public readonly id: number,
    public readonly order: Order,
    public readonly paidAt: Date,
  ) {}
}
