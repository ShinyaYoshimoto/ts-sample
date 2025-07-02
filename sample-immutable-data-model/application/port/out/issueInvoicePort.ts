import { InvoiceIssuance } from '../../domain/model/invoiceIssuance';
import { Order } from '../../domain/model/order';

export interface IssueInvoicePort {
  createInvoiceIssuance(order: Order): Promise<InvoiceIssuance>;
}
