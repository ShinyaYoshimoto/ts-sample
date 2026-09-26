import { Member } from '../../../application/domain/model/member';
import type { LoadMemberPort } from '../../../application/port/out/loadMemberPort';
import type { PrismaClient } from '../../../generated/prisma';

export class MemberPersistenceAdapter implements LoadMemberPort {
	constructor(private readonly prisma: PrismaClient) {}

	loadMember = async (memberId: number): Promise<Member> => {
		const member = await this.prisma.member.findUnique({
			where: {
				id: memberId,
			},
		});

		if (!member) {
			throw new Error('Member not found');
		}

		return new Member(member.id, member.name);
	};
}
