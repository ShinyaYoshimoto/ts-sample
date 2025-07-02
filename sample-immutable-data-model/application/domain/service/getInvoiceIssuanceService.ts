import { GetInvoiceIssuanceUseCase } from '../../port/in/getInvoiceIssuanceUseCase';
import { GetInvoiceIssuanceQuery } from '../../port/in/getInvoiceIssuanceQuery';
import { InvoiceIssuance } from '../model/invoiceIssuance';
import { LoadInvoiceIssuancePort } from '../../port/out/loadInvoiceIssuancePort';

export class GetInvoiceIssuanceService implements GetInvoiceIssuanceUseCase {
  constructor(private readonly loadInvoiceIssuancePort: LoadInvoiceIssuancePort) {}

  async getInvoiceIssuance(query: GetInvoiceIssuanceQuery): Promise<InvoiceIssuance | null> {
    const invoiceIssuance = await this.loadInvoiceIssuancePort.getInvoiceIssuance(query.order);
    if (!invoiceIssuance) {
      return null;
    }
    return invoiceIssuance;
  }
}
