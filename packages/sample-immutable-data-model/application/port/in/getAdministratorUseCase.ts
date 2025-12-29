import { GetAdministratorQuery } from './getAdministratorQuery';
import { Administrator } from '../../domain/model/administrator';

export interface GetAdministratorUseCase {
  getAdministrator(query: GetAdministratorQuery): Promise<Administrator | null>;
}
