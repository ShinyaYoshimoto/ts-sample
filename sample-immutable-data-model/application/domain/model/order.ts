import { Member } from "./member";

export class Order {
  constructor(
    readonly orderId: number,
    readonly member: Member,
    readonly orderedAt: Date,
  ) {
    if (!orderId) {
      throw new Error('orderId is required');
    }

    if (!member.memberId) {
      throw new Error('member is required');
    }
  }
}