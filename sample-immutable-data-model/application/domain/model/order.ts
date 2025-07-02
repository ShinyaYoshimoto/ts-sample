import { Member } from './member';

export class Order {
  constructor(
    readonly id: number,
    readonly member: Member,
    readonly orderedAt: Date,
    readonly confirmedAt?: Date,
  ) {
    if (!id || id < 0) {
      throw new Error('orderId is required');
    }

    if (!member.id) {
      throw new Error('member is required');
    }
  }
}
