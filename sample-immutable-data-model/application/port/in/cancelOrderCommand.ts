import { Order } from '../../domain/model/order';

export class CancelOrderCommand {
  constructor(public readonly order: Order) {}
}
