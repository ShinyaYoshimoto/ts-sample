import { Member } from '../../../application/domain/model/member';
import { Order } from '../../../application/domain/model/order';
import { RegisterOrderPort } from '../../../application/port/out/registerOrderPort';
import { LoadOrderPort } from '../../../application/port/out/loadOrderPort';
import { PrismaClient } from '../../../generated/prisma';
import { CanceledOrder } from '../../../application/domain/model/canceledOrder';

export class OrderPersistenceAdapter
  implements RegisterOrderPort, LoadOrderPort
{
  constructor(private readonly prisma: PrismaClient) {}

  loadOrder = async (orderId: number): Promise<Order | CanceledOrder> => {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        member: true,
        orderConfirmation: true,
        orderCancellations: true,
        scheduledPayments: true,
        payments: true,
        invoiceIssuances: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const memberEntity = new Member(order.member.id, order.member.name);
    const orderEntity = new Order(
      order.id,
      memberEntity,
      order.orderedAt,
      order.orderConfirmation[0]?.confirmedAt ?? undefined,
      order.scheduledPayments[0]?.scheduledPaymentDate ?? undefined,
      order.payments[0]?.paidAt ?? undefined,
      order.invoiceIssuances[0]?.issuedAt ?? undefined,
    );

    if (order.orderCancellations.length > 0) {
      return new CanceledOrder(
        orderEntity,
        order.orderCancellations[0].cancelledAt,
      );
    }

    return orderEntity;
  };

  searchOrders = async (): Promise<(Order | CanceledOrder)[]> => {
    const orders = await this.prisma.order.findMany({
      include: {
        member: true,
        orderConfirmation: true,
        orderCancellations: true,
        scheduledPayments: true,
        payments: true,
        invoiceIssuances: true,
      },
    });

    return orders.map((order) => {
      const memberEntity = new Member(order.member.id, order.member.name);
      const orderEntity = new Order(order.id, memberEntity, order.orderedAt);

      if (order.orderCancellations.length > 0) {
        return new CanceledOrder(
          orderEntity,
          order.orderCancellations[0].cancelledAt,
        );
      }

      return orderEntity;
    });
  };

  registerOrder = async (member: Member): Promise<Order> => {
    const order = await this.prisma.order.create({
      data: {
        memberId: member.id,
      },
    });

    return new Order(order.id, member, order.orderedAt);
  };
}
