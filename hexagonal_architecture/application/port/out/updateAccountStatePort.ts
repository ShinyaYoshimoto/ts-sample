import { Activity } from '../../domain/model/activity';

export interface UpdateAccountStatePort {
  updateAccountState(accountId: string, activities: Activity[]): boolean;
}
