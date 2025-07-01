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

class OrderConfirmationController {
  constructor(
    private readonly orderConfirmationUseCase: OrderConfirmationUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getAdministratorUseCase: GetAdministratorUseCase,
  ) {}

  public handle = async (request: Request) => {
    try {
      console.log('OrderConfirmationController: start');
      const orderQuery = new GetOrderQuery(request.orderId);
      const order = await this.getOrderUseCase.getOrder(orderQuery);

      if (!order) {
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
      const orderConfirmation =
        await this.orderConfirmationUseCase.confirmOrder(command);

      if (!orderConfirmation) {
        throw new Error('Order confirmation failed');
      }

      console.log('OrderConfirmationController: success');
    } catch (error) {
      console.error('OrderConfirmationController: failed');
    }
  };
}

type Request = {
  orderId: number;
  administratorId: number;
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

const orderConfirmationService = new OrderConfirmationService(
  orderPersistenceAdapter,
); // OrderConfirmationServiceはOrderPersistenceAdapterに依存すると仮定

// Request
const request: Request = {
  orderId: 1,
  administratorId: 1,
};
new OrderConfirmationController(
  orderConfirmationService,
  getOrderService,
  getAdministratorService,
).handle(request);
