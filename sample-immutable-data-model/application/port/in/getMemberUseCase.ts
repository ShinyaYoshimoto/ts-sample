import { Member } from '../../domain/model/member';
import { GetMemberQuery } from './getMemberQuery';

export interface GetMemberUseCase {
  getMember(query: GetMemberQuery): Promise<Member>;
}
