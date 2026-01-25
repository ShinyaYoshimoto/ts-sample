import type { InvoiceIssuance } from '../../domain/model/invoiceIssuance';
import type { IssueInvoiceCommand } from './issueInvoiceCommand';

export interface IssueInvoiceUseCase {
	issueInvoice(command: IssueInvoiceCommand): Promise<InvoiceIssuance | null>;
}
