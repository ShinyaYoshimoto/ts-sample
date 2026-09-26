import type { Administrator } from '../../domain/model/administrator';
import type { GetAdministratorQuery } from './getAdministratorQuery';

export interface GetAdministratorUseCase {
	getAdministrator(query: GetAdministratorQuery): Promise<Administrator | null>;
}
