import { InvoiceIssuance } from '../../domain/model/invoiceIssuance';
import { Order } from '../../domain/model/order';

export interface LoadInvoiceIssuancePort {
  getInvoiceIssuance(order: Order): Promise<InvoiceIssuance | null>;
}
