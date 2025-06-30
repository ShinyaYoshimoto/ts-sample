import { Member } from './member';

describe('Member', () => {
	it('should be created', () => {
		const member = new Member(1, 'John Doe');
		expect(member).toBeDefined();
	});
});