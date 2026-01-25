import type { SearchOrderUseCase } from '../../port/in/searchOrderUseCase';
import type { LoadOrderPort } from '../../port/out/loadOrderPort';
import type { CanceledOrder } from '../model/canceledOrder';
import type { Order } from '../model/order';

export class SearchOrderService implements SearchOrderUseCase {
	constructor(private readonly loadOrderPort: LoadOrderPort) {}

	searchOrders = (): Promise<(Order | CanceledOrder)[]> => {
		return this.loadOrderPort.searchOrders();
	};
}
