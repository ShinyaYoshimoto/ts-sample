import type { Administrator } from '../../domain/model/administrator';

export interface LoadAdministratorPort {
	loadAdministrator(administratorId: number): Promise<Administrator>;
}
