import { PrismaClient } from '../../../generated/prisma';
import { Administrator } from '../../../application/domain/model/administrator';
import { LoadAdministratorPort } from '../../../application/port/out/loadAdministratorPort';

export class AdministratorPersistenceAdapter implements LoadAdministratorPort {
  constructor(private readonly prisma: PrismaClient) {}

  loadAdministrator = async (
    administratorId: number,
  ): Promise<Administrator> => {
    const administrator = await this.prisma.administrator.findUnique({
      where: {
        id: administratorId,
      },
    });

    if (!administrator) {
      throw new Error('Administrator not found');
    }

    return new Administrator(administrator.id, administrator.name);
  };
}
