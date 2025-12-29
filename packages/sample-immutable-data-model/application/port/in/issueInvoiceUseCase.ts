import { IssueInvoiceCommand } from './issueInvoiceCommand';
import { InvoiceIssuance } from '../../domain/model/invoiceIssuance';

export interface IssueInvoiceUseCase {
  issueInvoice(command: IssueInvoiceCommand): Promise<InvoiceIssuance | null>;
}
