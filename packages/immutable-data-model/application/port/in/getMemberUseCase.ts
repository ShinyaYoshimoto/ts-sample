import type { Member } from '../../domain/model/member';
import type { GetMemberQuery } from './getMemberQuery';

export interface GetMemberUseCase {
	getMember(query: GetMemberQuery): Promise<Member>;
}
