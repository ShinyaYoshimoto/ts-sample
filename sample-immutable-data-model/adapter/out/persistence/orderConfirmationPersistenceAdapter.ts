import { Administrator } from '../../../application/domain/model/administrator';
import { Order } from '../../../application/domain/model/order';
import { OrderConfirmation } from '../../../application/domain/model/orderConfirmation';
import { ConfirmOrderPort } from '../../../application/port/out/confirmOrderPort';
import { PrismaClient } from '../../../generated/prisma';

export class OrderConfirmationPersistenceAdapter implements ConfirmOrderPort {
  constructor(private readonly prisma: PrismaClient) {}

  confirmOrder = async (
    order: Order,
    administrator: Administrator,
  ): Promise<OrderConfirmation> => {
    const confirmedOrder = await this.prisma.orderConfirmation.create({
      data: {
        orderId: order.id,
        administratorId: administrator.id,
        confirmedAt: new Date(),
      },
    });

    return new OrderConfirmation(
      confirmedOrder.id,
      order,
      administrator,
      confirmedOrder.confirmedAt,
    );
  };
}
