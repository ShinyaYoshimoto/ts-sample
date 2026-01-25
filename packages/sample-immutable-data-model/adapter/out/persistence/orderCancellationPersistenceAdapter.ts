import type { Order } from '../../../application/domain/model/order';
import { OrderCancellation } from '../../../application/domain/model/orderCancellation';
import type { CancelOrderPort } from '../../../application/port/out/cancelOrderPort';
import type { PrismaClient } from '../../../generated/prisma';

export class OrderCancellationPersistenceAdapter implements CancelOrderPort {
	constructor(private readonly prisma: PrismaClient) {}

	async createOrderCancellation(order: Order): Promise<OrderCancellation> {
		const orderCancellation = await this.prisma.orderCancellation.create({
			data: {
				orderId: order.id,
				cancelledAt: new Date(),
			},
		});
		return new OrderCancellation(
			orderCancellation.id,
			order,
			orderCancellation.cancelledAt,
		);
	}
}
