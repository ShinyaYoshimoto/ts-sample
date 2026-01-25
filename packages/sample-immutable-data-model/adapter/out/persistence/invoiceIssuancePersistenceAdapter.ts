import { InvoiceIssuance } from '../../../application/domain/model/invoiceIssuance';
import type { Order } from '../../../application/domain/model/order';
import type { IssueInvoicePort } from '../../../application/port/out/issueInvoicePort';
import type { LoadInvoiceIssuancePort } from '../../../application/port/out/loadInvoiceIssuancePort';
import type { PrismaClient } from '../../../generated/prisma';

export class InvoiceIssuancePersistenceAdapter
	implements IssueInvoicePort, LoadInvoiceIssuancePort
{
	constructor(private readonly prisma: PrismaClient) {}

	async createInvoiceIssuance(order: Order): Promise<InvoiceIssuance> {
		const invoiceIssuance = await this.prisma.invoiceIssuance.create({
			data: {
				orderId: order.id,
				issuedAt: new Date(),
			},
		});
		return new InvoiceIssuance(
			invoiceIssuance.id,
			order,
			invoiceIssuance.issuedAt,
		);
	}

	async getInvoiceIssuance(order: Order): Promise<InvoiceIssuance | null> {
		const invoiceIssuance = await this.prisma.invoiceIssuance.findUnique({
			where: { orderId: order.id },
		});
		if (!invoiceIssuance) {
			return null;
		}
		return new InvoiceIssuance(
			invoiceIssuance.id,
			order,
			invoiceIssuance.issuedAt,
		);
	}
}
