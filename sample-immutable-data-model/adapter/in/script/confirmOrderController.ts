import { OrderConfirmationService } from '../../../application/domain/service/orderConfirmationService';
import { OrderConfirmationUseCase } from '../../../application/port/in/orderConfirmationUseCase';
import { GetOrderUseCase } from '../../../application/port/in/getOrderUseCase';
import { GetOrderService } from '../../../application/domain/service/getOrderService';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
import { PrismaClient } from '../../../generated/prisma';
import { GetOrderQuery } from '../../../application/port/in/getOrderQuery';
import { OrderConfirmationCommand } from '../../../application/port/in/orderConfirmationCommand';
import { AdministratorPersistenceAdapter } from '../../out/persistence/administratorPersistenceAdapter';
import { GetAdministratorUseCase } from '../../../application/port/in/getAdministratorUseCase';
import { GetAdministratorService } from '../../../application/domain/service/getAdministratorService';
import { GetAdministratorQuery } from '../../../application/port/in/getAdministratorQuery';
import { OrderConfirmationPersistenceAdapter } from '../../out/persistence/orderConfirmationPersistenceAdapter';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { Order } from '../../../application/domain/model/order';
class ConfirmOrderController {
  constructor(
    private readonly orderConfirmationUseCase: OrderConfirmationUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getAdministratorUseCase: GetAdministratorUseCase,
  ) {}

  public handle = async (request: Request) => {
    try {
      console.log('ConfirmOrderController: start');
      const orderQuery = new GetOrderQuery(request.orderId);
      const order = await this.getOrderUseCase.getOrder(orderQuery);

      if (!order || !(order instanceof Order)) {
        throw new Error('Order not found');
      }

      const administratorQuery = new GetAdministratorQuery(
        request.administratorId,
      );
      const administrator =
        await this.getAdministratorUseCase.getAdministrator(administratorQuery);

      if (!administrator) {
        throw new Error('Administrator not found');
      }

      const command = new OrderConfirmationCommand(order, administrator);
      await this.orderConfirmationUseCase.confirmOrder(command);

      console.log('ConfirmOrderController: success');
    } catch (error) {
      console.error('ConfirmOrderController: failed');
    }
  };
}

type Request = {
  orderId: number;
  administratorId: number;
};

// Request

const rl = readline.createInterface({ input, output });
const list: string[] = [];

// initial prompt
rl.setPrompt('orderId: ');
rl.prompt();

rl.on('line', (line) => {
  list.push(line);

  switch (list.length) {
    case 1:
      rl.setPrompt('administratorId: ');
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
  const request: Request = {
    orderId: parseInt(list[0]),
    administratorId: parseInt(list[1]),
  };

  const prisma = new PrismaClient();

  const orderPersistenceAdapter = new OrderPersistenceAdapter(prisma);
  const getOrderService = new GetOrderService(orderPersistenceAdapter);

  const administratorPersistenceAdapter = new AdministratorPersistenceAdapter(
    prisma,
  );
  const getAdministratorService = new GetAdministratorService(
    administratorPersistenceAdapter,
  );

  const orderConfirmationPersistenceAdapter =
    new OrderConfirmationPersistenceAdapter(prisma);

  const orderConfirmationService = new OrderConfirmationService(
    orderConfirmationPersistenceAdapter,
  );

  new ConfirmOrderController(
    orderConfirmationService,
    getOrderService,
    getAdministratorService,
  ).handle(request);
});
