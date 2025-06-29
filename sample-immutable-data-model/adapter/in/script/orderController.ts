import { OrderService } from '../../../application/domain/service/orderService';
import { OrderUseCase } from '../../../application/port/in/orderUseCase';
import { GetMemberUseCase } from '../../../application/port/in/getMemberUseCase';
import { GetMemberService } from '../../../application/domain/service/getMemberService';
import { MemberPersistenceAdapter } from '../../out/persistence/memberPersistenceAdapter';
import { PrismaClient } from '../../../generated/prisma';
import { GetMemberQuery } from '../../../application/port/in/getMemberQuery';
import { OrderCommand } from '../../../application/port/in/orderCommand';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
class OrderController {
  constructor(
    private readonly orderUseCase: OrderUseCase,
    private readonly getMemberUseCase: GetMemberUseCase,
  ) {}
  public handle = async (request: Request) => {
    console.log('OrderController: start');

    const query = new GetMemberQuery(request.memberId);
    const member = await this.getMemberUseCase.getMember(query);

    if (!member) {
      throw new Error('Member not found');
    }

    const command = new OrderCommand(member);
    const order = await this.orderUseCase.order(command);

    if (!order) {
      throw new Error('Order failed');
    }

    console.log('OrderController: end');
  };
}

type Request = {
  memberId: number;
}

const prisma = new PrismaClient();

const memberPersistenceAdapter = new MemberPersistenceAdapter(prisma);
const getMemberService = new GetMemberService(memberPersistenceAdapter);

const orderPersistenceAdapter = new OrderPersistenceAdapter(prisma);
const orderService = new OrderService(orderPersistenceAdapter);

// Request
const request: Request = {
  memberId: 1,
};
new OrderController(orderService, getMemberService).handle(request);
