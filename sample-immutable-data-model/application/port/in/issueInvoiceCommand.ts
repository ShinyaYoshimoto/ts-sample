import { Order } from '../../domain/model/order';

export class IssueInvoiceCommand {
  constructor(public readonly order: Order) {}
}
