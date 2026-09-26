import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { Order } from '../../../application/domain/model/order';
import { GetAdministratorService } from '../../../application/domain/service/getAdministratorService';
import { GetOrderService } from '../../../application/domain/service/getOrderService';
import { OrderConfirmationService } from '../../../application/domain/service/orderConfirmationService';
import { GetAdministratorQuery } from '../../../application/port/in/getAdministratorQuery';
import type { GetAdministratorUseCase } from '../../../application/port/in/getAdministratorUseCase';
import { GetOrderQuery } from '../../../application/port/in/getOrderQuery';
import type { GetOrderUseCase } from '../../../application/port/in/getOrderUseCase';
import { OrderConfirmationCommand } from '../../../application/port/in/orderConfirmationCommand';
import type { OrderConfirmationUseCase } from '../../../application/port/in/orderConfirmationUseCase';
import { PrismaClient } from '../../../generated/prisma';
import { AdministratorPersistenceAdapter } from '../../out/persistence/administratorPersistenceAdapter';
import { OrderConfirmationPersistenceAdapter } from '../../out/persistence/orderConfirmationPersistenceAdapter';
import { OrderPersistenceAdapter } from '../../out/persistence/orderPersistenceAdapter';
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
		orderId: Number.parseInt(list[0]),
		administratorId: Number.parseInt(list[1]),
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
