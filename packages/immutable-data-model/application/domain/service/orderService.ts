import type { OrderCommand } from '../../port/in/orderCommand';
import type { OrderUseCase } from '../../port/in/orderUseCase';
import type { RegisterOrderPort } from '../../port/out/registerOrderPort';
import { Order } from '../model/order';

export class OrderService implements OrderUseCase {
	constructor(private readonly registerOrderPort: RegisterOrderPort) {}

	order = async (command: OrderCommand): Promise<void> => {
		await this.registerOrderPort.registerOrder(command.member);
	};
}
