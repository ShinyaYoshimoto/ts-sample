import { SearchOrderUseCase } from "../../port/in/searchOrderUseCase";
import { LoadOrderPort } from "../../port/out/loadOrderPort";
import { CanceledOrder } from "../model/canceledOrder";
import { Order } from "../model/order";

export class SearchOrderService implements SearchOrderUseCase {
  constructor(private readonly loadOrderPort: LoadOrderPort) {}

  searchOrders = (): Promise<(Order | CanceledOrder)[]> => {
    return this.loadOrderPort.searchOrders();
  }
}