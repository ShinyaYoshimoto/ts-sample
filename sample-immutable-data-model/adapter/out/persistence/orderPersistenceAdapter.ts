import { Member } from '../../../application/domain/model/member';
import { Order } from '../../../application/domain/model/order';
import { RegisterOrderPort } from '../../../application/port/out/registerOrderPort';
import { PrismaClient } from '../../../generated/prisma';

export class OrderPersistenceAdapter implements RegisterOrderPort {
  constructor(private readonly prisma: PrismaClient) {}

  registerOrder = async (member: Member): Promise<Order> => {
    const order = await this.prisma.order.create({
      data: {
        memberId: member.memberId,
      },
    });

    return new Order(order.id, order.memberId, order.orderedAt);
  };
}
