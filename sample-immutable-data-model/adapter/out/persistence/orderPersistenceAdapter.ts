import { Member } from '../../../application/domain/model/member';
import { Order } from '../../../application/domain/model/order';
import { RegisterOrderPort } from '../../../application/port/out/registerOrderPort';
import { LoadOrderPort } from '../../../application/port/out/loadOrderPort';
import { PrismaClient } from '../../../generated/prisma';
import { Administrator } from '../../../application/domain/model/administrator';
import { OrderConfirmation } from '../../../application/domain/model/orderConfirmation';
import { ConfirmOrderPort } from '../../../application/port/out/confirmOrderPort';

export class OrderPersistenceAdapter
  implements RegisterOrderPort, LoadOrderPort, ConfirmOrderPort
{
  constructor(private readonly prisma: PrismaClient) {}

  loadOrder = async (orderId: number): Promise<Order> => {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        member: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const memberEntity = new Member(order.member.id, order.member.name);
    return new Order(order.id, memberEntity, order.orderedAt);
  };

  registerOrder = async (member: Member): Promise<Order> => {
    const order = await this.prisma.order.create({
      data: {
        memberId: member.id,
      },
    });

    return new Order(order.id, member, order.orderedAt);
  };

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
