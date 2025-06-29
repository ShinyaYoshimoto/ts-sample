import { GetMemberQuery } from '../../port/in/getMemberQuery';
import { GetMemberUseCase } from '../../port/in/getMemberUseCase';
import { Member } from '../model/member';
import { LoadMemberPort } from '../../port/out/loadMemberPort';

export class GetMemberService implements GetMemberUseCase {
  constructor(private readonly loadMemberPort: LoadMemberPort) {}

  getMember = async (query: GetMemberQuery): Promise<Member> => {
    return this.loadMemberPort.loadMember(query.memberId);
  }
}
