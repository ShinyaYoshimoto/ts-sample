import { Member } from '../../domain/model/member';
import { Order } from '../../domain/model/order';

export interface RegisterOrderPort {
  registerOrder(member: Member): Promise<Order>;
}
