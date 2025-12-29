import { Order } from '../../domain/model/order';

export class PayCommand {
  constructor(
    public readonly order: Order,
  ) {}
}
