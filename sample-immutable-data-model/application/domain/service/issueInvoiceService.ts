import { IssueInvoiceUseCase } from '../../port/in/issueInvoiceUseCase';
import { IssueInvoiceCommand } from '../../port/in/issueInvoiceCommand';
import { InvoiceIssuance } from '../model/invoiceIssuance';
import { IssueInvoicePort } from '../../port/out/issueInvoicePort';

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
