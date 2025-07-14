import { SearchOrderService } from '../../../application/domain/service/searchOrderService';
import { SearchOrderUseCase } from '../../../application/port/in/searchOrderUseCase';
import { PrismaClient } from '../../../generated/prisma';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';

export class SearchOrderController {
  constructor(private readonly searchOrderUseCase: SearchOrderUseCase) {}

  public handle = async (request: Request) => {
    try {
      console.log('SearchOrderController: start');

      const orders = await this.searchOrderUseCase.searchOrders();

      console.log('SearchOrderController: end', orders);
    } catch (error) {
      console.error('SearchOrderController: failed', error);
      throw error;
    }
  };
}

type Request = {};

const prisma = new PrismaClient();
const orderPersistenceAdapter = new OrderPersistenceAdapter(prisma);
const searchOrderService = new SearchOrderService(orderPersistenceAdapter);

const searchOrderController = new SearchOrderController(searchOrderService);

searchOrderController.handle({});