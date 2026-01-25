import type { InvoiceIssuance } from '../../domain/model/invoiceIssuance';
import type { Order } from '../../domain/model/order';

export interface LoadInvoiceIssuancePort {
	getInvoiceIssuance(order: Order): Promise<InvoiceIssuance | null>;
}
