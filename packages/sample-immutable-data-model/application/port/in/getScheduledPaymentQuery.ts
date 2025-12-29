import { Order } from '../../domain/model/order';

export class GetScheduledPaymentQuery {
  constructor(public readonly order: Order) {}
}
