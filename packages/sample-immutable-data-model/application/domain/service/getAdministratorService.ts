import { GetAdministratorUseCase } from '../../port/in/getAdministratorUseCase';
import { GetAdministratorQuery } from '../../port/in/getAdministratorQuery';
import { Administrator } from '../model/administrator';
import { LoadAdministratorPort } from '../../port/out/loadAdministratorPort';

export class GetAdministratorService implements GetAdministratorUseCase {
  constructor(private readonly loadAdministratorPort: LoadAdministratorPort) {}

  async getAdministrator(query: GetAdministratorQuery): Promise<Administrator | null> {
    const administrator = await this.loadAdministratorPort.loadAdministrator(query.administratorId);
    if (!administrator) {
      throw new Error('Administrator not found');
    }
    return administrator;
  }
}
