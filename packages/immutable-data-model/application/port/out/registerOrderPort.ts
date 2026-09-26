import type { Member } from '../../domain/model/member';
import type { Order } from '../../domain/model/order';

export interface RegisterOrderPort {
	registerOrder(member: Member): Promise<Order>;
}
