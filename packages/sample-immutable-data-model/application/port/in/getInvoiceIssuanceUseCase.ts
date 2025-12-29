import { GetInvoiceIssuanceQuery } from './getInvoiceIssuanceQuery';
import { InvoiceIssuance } from '../../domain/model/invoiceIssuance';

export interface GetInvoiceIssuanceUseCase {
  getInvoiceIssuance(query: GetInvoiceIssuanceQuery): Promise<InvoiceIssuance | null>;
}
