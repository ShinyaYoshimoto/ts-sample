import type { Order } from '../../../application/domain/model/order';
import { Payment } from '../../../application/domain/model/payment';
import type { LoadPaidOrderPort } from '../../../application/port/out/loadPaidOrderPort';
import type { PayOrderPort } from '../../../application/port/out/payOrderPort';
import type { PrismaClient } from '../../../generated/prisma';

export class PaymentPersistenceAdapter
	implements PayOrderPort, LoadPaidOrderPort
{
	constructor(private readonly prisma: PrismaClient) {}

	async createPayment(order: Order): Promise<Payment> {
		const payment = await this.prisma.payment.create({
			data: {
				orderId: order.id,
				paidAt: new Date(),
			},
		});
		return new Payment(payment.id, order, payment.paidAt);
	}

	async getPayment(order: Order): Promise<Payment | null> {
		const payment = await this.prisma.payment.findUnique({
			where: { orderId: order.id },
		});
		if (!payment) {
			return null;
		}
		// ここでPrismaのPaymentモデルからドメインのPaymentモデルに変換
		return new Payment(payment.id, order, payment.paidAt);
	}
}
