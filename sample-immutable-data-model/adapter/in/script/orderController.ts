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
    try {
      console.log('OrderController: start');

      const query = new GetMemberQuery(request.memberId);
      const member = await this.getMemberUseCase.getMember(query);

      if (!member) {
        throw new Error('Member not found');
      }

      const command = new OrderCommand(member);
      await this.orderUseCase.order(command);

      console.log('OrderController: end');
    } catch (error) {
      console.error('OrderController: failed');
    }
  };
}

type Request = {
  memberId: number;
};

// Request
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';

const rl = readline.createInterface({ input, output });
const list: string[] = [];

// initial prompt
rl.setPrompt('memberId: ');
rl.prompt();

rl.on('line', (line) => {
  list.push(line);

  if (list.length >= 1) {
    rl.close();
  }
});

rl.on('close', () => {
  const request: Request = {
    memberId: parseInt(list[0]),
  };

  const prisma = new PrismaClient();

  const memberPersistenceAdapter = new MemberPersistenceAdapter(prisma);
  const getMemberService = new GetMemberService(memberPersistenceAdapter);

  const orderPersistenceAdapter = new OrderPersistenceAdapter(prisma);
  const orderService = new OrderService(orderPersistenceAdapter);

  new OrderController(orderService, getMemberService).handle(request);
});
