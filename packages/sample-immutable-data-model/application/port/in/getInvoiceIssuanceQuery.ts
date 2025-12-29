import { Order } from '../../domain/model/order';

export class GetInvoiceIssuanceQuery {
  constructor(public readonly order: Order) {}
}
