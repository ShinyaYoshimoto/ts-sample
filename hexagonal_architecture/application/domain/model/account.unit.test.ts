import { Account } from './account';
import { Money } from './money';
import { ActivityWindow } from './activityWindow';
import { Activity } from './activity';

describe('Account', () => {
  let mockActivityWindow: ActivityWindow;

  beforeEach(() => {
    mockActivityWindow = {
      calculateBalance: vi.fn(),
      addActivity: vi.fn(),
    } as any;
  });

  describe('constructor', () => {
    it('should create an account with given parameters', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(500);

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );

      expect(account).toBeDefined();
    });
  });

  describe('calculateBalance', () => {
    it('should return sum of baseline balance and activity window balance', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(500);
      (mockActivityWindow.calculateBalance as any).mockReturnValue(
        new Money(200),
      );

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const balance = account.calculateBalance();

      expect(balance.amount).toBe(700);
      expect(mockActivityWindow.calculateBalance).toHaveBeenCalledWith(
        accountId,
      );
    });

    it('should handle negative activity window balance', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(500);
      (mockActivityWindow.calculateBalance as any).mockReturnValue(
        new Money(-200),
      );

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const balance = account.calculateBalance();

      expect(balance.amount).toBe(300);
    });
  });

  describe('withdraw', () => {
    it('should successfully withdraw when sufficient balance', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(1000);
      (mockActivityWindow.calculateBalance as any).mockReturnValue(
        new Money(0),
      );

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const withdrawAmount = new Money(500);
      const targetAccountId = 'account-2';

      const result = account.withdraw(withdrawAmount, targetAccountId);

      expect(result).toBe(true);
      expect(mockActivityWindow.addActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: accountId,
          targetAccountId: targetAccountId,
          amount: withdrawAmount,
        }),
      );
    });

    it('should fail to withdraw when insufficient balance', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(100);
      (mockActivityWindow.calculateBalance as any).mockReturnValue(
        new Money(0),
      );

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const withdrawAmount = new Money(200);
      const targetAccountId = 'account-2';

      const result = account.withdraw(withdrawAmount, targetAccountId);

      expect(result).toBe(false);
      expect(mockActivityWindow.addActivity).not.toHaveBeenCalled();
    });

    it('should fail to withdraw when resulting balance would be zero', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(100);
      (mockActivityWindow.calculateBalance as any).mockReturnValue(
        new Money(0),
      );

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const withdrawAmount = new Money(100);
      const targetAccountId = 'account-2';

      const result = account.withdraw(withdrawAmount, targetAccountId);

      expect(result).toBe(false);
      expect(mockActivityWindow.addActivity).not.toHaveBeenCalled();
    });

    it('should create activity with correct timestamp', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(1000);
      (mockActivityWindow.calculateBalance as any).mockReturnValue(
        new Money(0),
      );

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const withdrawAmount = new Money(500);
      const targetAccountId = 'account-2';

      const beforeWithdraw = new Date();
      account.withdraw(withdrawAmount, targetAccountId);
      const afterWithdraw = new Date();

      expect(mockActivityWindow.addActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Date),
        }),
      );

      const addedActivity = (mockActivityWindow.addActivity as any).mock
        .calls[0][0];
      expect(addedActivity.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeWithdraw.getTime(),
      );
      expect(addedActivity.timestamp.getTime()).toBeLessThanOrEqual(
        afterWithdraw.getTime(),
      );
    });
  });

  describe('deposit', () => {
    it('should successfully deposit money', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(500);

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const depositAmount = new Money(300);
      const sourceAccountId = 'account-2';

      const result = account.deposit(depositAmount, sourceAccountId);

      expect(result).toBe(true);
      expect(mockActivityWindow.addActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: sourceAccountId,
          targetAccountId: accountId,
          amount: depositAmount,
        }),
      );
    });

    it('should create deposit activity with correct timestamp', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(500);

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );
      const depositAmount = new Money(300);
      const sourceAccountId = 'account-2';

      const beforeDeposit = new Date();
      account.deposit(depositAmount, sourceAccountId);
      const afterDeposit = new Date();

      expect(mockActivityWindow.addActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Date),
        }),
      );

      const addedActivity = (mockActivityWindow.addActivity as any).mock
        .calls[0][0];
      expect(addedActivity.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeDeposit.getTime(),
      );
      expect(addedActivity.timestamp.getTime()).toBeLessThanOrEqual(
        afterDeposit.getTime(),
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple transactions correctly', () => {
      const accountId = 'account-1';
      const baselineBalance = new Money(1000);
      (mockActivityWindow.calculateBalance as any).mockReturnValue(
        new Money(0),
      );

      const account = new Account(
        accountId,
        baselineBalance,
        mockActivityWindow,
      );

      const depositResult = account.deposit(new Money(500), 'account-2');
      const withdrawResult = account.withdraw(new Money(200), 'account-3');

      expect(depositResult).toBe(true);
      expect(withdrawResult).toBe(true);
      expect(mockActivityWindow.addActivity).toHaveBeenCalledTimes(2);
    });
  });
});
