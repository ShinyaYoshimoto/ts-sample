import { PrismaClient } from '../../../generated/prisma';
import { OrderCancellation } from '../../../application/domain/model/orderCancellation';
import { CancelOrderPort } from '../../../application/port/out/cancelOrderPort';
import { Order } from '../../../application/domain/model/order';

export class OrderCancellationPersistenceAdapter implements CancelOrderPort {
  constructor(private readonly prisma: PrismaClient) {}

  async createOrderCancellation(order: Order): Promise<OrderCancellation> {
    const orderCancellation = await this.prisma.orderCancellation.create({
      data: {
        orderId: order.id,
        cancelledAt: new Date(),
      },
    });
    return new OrderCancellation(orderCancellation.id, order, orderCancellation.cancelledAt);
  }
}
