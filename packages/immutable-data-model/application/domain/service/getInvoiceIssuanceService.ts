import type { GetInvoiceIssuanceQuery } from '../../port/in/getInvoiceIssuanceQuery';
import type { GetInvoiceIssuanceUseCase } from '../../port/in/getInvoiceIssuanceUseCase';
import type { LoadInvoiceIssuancePort } from '../../port/out/loadInvoiceIssuancePort';
import type { InvoiceIssuance } from '../model/invoiceIssuance';

export class GetInvoiceIssuanceService implements GetInvoiceIssuanceUseCase {
	constructor(
		private readonly loadInvoiceIssuancePort: LoadInvoiceIssuancePort,
	) {}

	async getInvoiceIssuance(
		query: GetInvoiceIssuanceQuery,
	): Promise<InvoiceIssuance | null> {
		const invoiceIssuance =
			await this.loadInvoiceIssuancePort.getInvoiceIssuance(query.order);
		if (!invoiceIssuance) {
			return null;
		}
		return invoiceIssuance;
	}
}
