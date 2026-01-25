import type { InvoiceIssuance } from '../../domain/model/invoiceIssuance';
import type { Order } from '../../domain/model/order';

export interface IssueInvoicePort {
	createInvoiceIssuance(order: Order): Promise<InvoiceIssuance>;
}
