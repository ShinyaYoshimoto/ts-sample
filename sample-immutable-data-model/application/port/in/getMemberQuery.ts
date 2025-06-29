export class GetMemberQuery {
  constructor(readonly memberId: number) {
    if (!memberId) {
      throw new Error('memberId is required');
    }
  }
}
