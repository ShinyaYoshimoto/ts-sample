import type { GetAdministratorQuery } from '../../port/in/getAdministratorQuery';
import type { GetAdministratorUseCase } from '../../port/in/getAdministratorUseCase';
import type { LoadAdministratorPort } from '../../port/out/loadAdministratorPort';
import type { Administrator } from '../model/administrator';

export class GetAdministratorService implements GetAdministratorUseCase {
	constructor(private readonly loadAdministratorPort: LoadAdministratorPort) {}

	async getAdministrator(
		query: GetAdministratorQuery,
	): Promise<Administrator | null> {
		const administrator = await this.loadAdministratorPort.loadAdministrator(
			query.administratorId,
		);
		if (!administrator) {
			throw new Error('Administrator not found');
		}
		return administrator;
	}
}
