import type { IssueInvoiceCommand } from '../../port/in/issueInvoiceCommand';
import type { IssueInvoiceUseCase } from '../../port/in/issueInvoiceUseCase';
import type { IssueInvoicePort } from '../../port/out/issueInvoicePort';
import type { InvoiceIssuance } from '../model/invoiceIssuance';

export class IssueInvoiceService implements IssueInvoiceUseCase {
	constructor(private readonly issueInvoicePort: IssueInvoicePort) {}

	async issueInvoice(
		command: IssueInvoiceCommand,
	): Promise<InvoiceIssuance | null> {
		const invoiceIssuance = await this.issueInvoicePort.createInvoiceIssuance(
			command.order,
		);
		return invoiceIssuance;
	}
}
