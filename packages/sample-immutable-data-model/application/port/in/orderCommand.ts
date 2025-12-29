import { Member } from '../../domain/model/member';

export class OrderCommand {
  constructor(readonly member: Member) {}
}
