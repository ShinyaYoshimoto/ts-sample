import type { InvoiceIssuance } from '../../domain/model/invoiceIssuance';
import type { GetInvoiceIssuanceQuery } from './getInvoiceIssuanceQuery';

export interface GetInvoiceIssuanceUseCase {
	getInvoiceIssuance(
		query: GetInvoiceIssuanceQuery,
	): Promise<InvoiceIssuance | null>;
}
