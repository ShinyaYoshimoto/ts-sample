import { SchedulePaymentUseCase } from '../../../application/port/in/schedulePaymentUseCase';
import { GetOrderUseCase } from '../../../application/port/in/getOrderUseCase';
import { GetOrderQuery } from '../../../application/port/in/getOrderQuery';
import { SchedulePaymentCommand } from '../../../application/port/in/schedulePaymentCommand';
import { PrismaClient } from '../../../generated/prisma';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
import { GetOrderService } from '../../../application/domain/service/getOrderService';
import { ScheduledPaymentPersistenceAdapter } from '../../out/persistence/scheduledPaymentPersistenceAdapter';
import { SchedulePaymentService } from '../../../application/domain/service/schedulePaymentService';
import { Order } from '../../../application/domain/model/order';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';

class SchedulePaymentController {
  constructor(
    private readonly schedulePaymentUseCase: SchedulePaymentUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  public handle = async (request: Request) => {
    try {
      console.log('SchedulePaymentController: start');

      const orderQuery = new GetOrderQuery(request.orderId);
      const order = await this.getOrderUseCase.getOrder(orderQuery);

      if (!order || !(order instanceof Order)) {
        throw new Error('Order not found');
      }

      const command = new SchedulePaymentCommand(
        order,
        request.scheduledPaymentDate,
      );
      await this.schedulePaymentUseCase.schedulePayment(command);

      console.log('SchedulePaymentController: end');
    } catch (error) {
      console.error('SchedulePaymentController: failed');
    }
  };
}

type Request = {
  orderId: number;
  scheduledPaymentDate: Date;
};

const rl = readline.createInterface({ input, output });
const list: string[] = [];

// initial prompt
rl.setPrompt('orderId: ');
rl.prompt();

rl.on('line', (line) => {
  list.push(line);

  switch (list.length) {
    case 1:
      rl.setPrompt('scheduledPaymentDate(cf. yyyy-mm-dd): ');
      rl.prompt();
      break;
    case 2:
      break;
    default:
      throw new Error('Invalid input');
  }

  if (list.length >= 2) {
    rl.close();
  }
});

rl.on('close', () => {
  const prisma = new PrismaClient();
  const orderPersistenceAdapter = new OrderPersistenceAdapter(prisma);
  const getOrderService = new GetOrderService(orderPersistenceAdapter);

  const scheduledPaymentPersistenceAdapter =
    new ScheduledPaymentPersistenceAdapter(prisma);
  const schedulePaymentService = new SchedulePaymentService(
    scheduledPaymentPersistenceAdapter,
  );

  // Request
  const request: Request = {
    orderId: parseInt(list[0]),
    scheduledPaymentDate: new Date(list[1]),
  };
  new SchedulePaymentController(schedulePaymentService, getOrderService).handle(
    request,
  );
});
