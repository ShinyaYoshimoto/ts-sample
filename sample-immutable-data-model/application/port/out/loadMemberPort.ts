import { Member } from '../../domain/model/member';

export interface LoadMemberPort {
  loadMember(memberId: number): Promise<Member>;
}
