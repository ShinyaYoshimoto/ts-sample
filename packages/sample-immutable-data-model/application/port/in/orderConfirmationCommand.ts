import { Order } from '../../domain/model/order';
import { Administrator } from '../../domain/model/administrator';

export class OrderConfirmationCommand {
  constructor(
    public readonly order: Order,
    public readonly administrator: Administrator,
  ) {}
}
