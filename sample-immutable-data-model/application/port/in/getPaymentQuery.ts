import { Order } from '../../domain/model/order';

export class GetPaymentQuery {
  constructor(public readonly order: Order) {}
}
