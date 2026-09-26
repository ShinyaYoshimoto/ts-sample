import type { GetMemberQuery } from '../../port/in/getMemberQuery';
import type { GetMemberUseCase } from '../../port/in/getMemberUseCase';
import type { LoadMemberPort } from '../../port/out/loadMemberPort';
import type { Member } from '../model/member';

export class GetMemberService implements GetMemberUseCase {
	constructor(private readonly loadMemberPort: LoadMemberPort) {}

	getMember = async (query: GetMemberQuery): Promise<Member> => {
		const member = await this.loadMemberPort.loadMember(query.memberId);
		if (!member) {
			throw new Error('Member not found');
		}
		return member;
	};
}
