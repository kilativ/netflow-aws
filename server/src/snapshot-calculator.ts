import { SnapshotBalance, SnapshotDto } from '../../shared/models/snapshot-dto';
import { NetFlowUser } from '../../shared/models/account-dto';
import { BalanceDal } from './dal/balance-dal';
import { Account} from 'plaid';
import { TransactionDal } from './dal/transactions-dal';
import { AccountDal } from './dal/account-dal';
import { AccountSnapshotScheduledTransactionsSettings } from '../../shared/models/account-dto';

export class SnapshotCalculator {
  user: NetFlowUser;

    public async get(account: Account, numOfDays: number, numOfDaysToPredict: number, userId: string):Promise<SnapshotDto> {

      this.user = (await new AccountDal().get(userId));
      
      const results: SnapshotBalance[]= [];
      const mult = (account.type === 'credit')? -1: 1;

      const accountId = account.account_id
      const balances =  await new BalanceDal().getAllForAccount(accountId);
      const latestBalances= balances.reduce((prev,current)=> (prev.date > current.date)? prev: current);
      const latestBalanceAcount = latestBalances.current * mult;


      const lowerLimitDate = new Date(latestBalances.date);
      lowerLimitDate.setDate(lowerLimitDate.getDate() - numOfDays);

      let allTxns = await new TransactionDal().getForAccountBetweenDates(accountId, lowerLimitDate, new Date(latestBalances.date));
    
      allTxns = allTxns.filter(txn=> txn.date < latestBalances.date && new Date(txn.date) >= lowerLimitDate && !txn.pending).sort((a,b)=> {return a.date.localeCompare(b.date);});
    
      const sumOfAllAmounts = allTxns.map(txn=>txn.amount).reduce((t1,t2)=>t1+t2, 0);
      const startingBalance = latestBalanceAcount + sumOfAllAmounts;
    
      results.push(SnapshotBalance.build(lowerLimitDate, startingBalance, startingBalance, "balance on " + lowerLimitDate.toDateString(), false));
    
      let curBalance = startingBalance;
      allTxns.forEach (txn=> {
        curBalance = curBalance - txn.amount;
        results.push(SnapshotBalance.build(new Date(txn.date), curBalance, -1 * txn.amount, txn.name, false));
      })
      results.push(SnapshotBalance.build(new Date(latestBalances.date), latestBalanceAcount, 0, 'current', false));
      results.push(SnapshotBalance.build(new Date(latestBalances.date), latestBalanceAcount, 0, 'current', true));

      const lastDateToPredict = new Date(latestBalances.date);
      lastDateToPredict.setDate(lastDateToPredict.getDate() + numOfDaysToPredict);

      return {
        account: account, 
        balances:  [... results, ... await this.getPredictedTransactions(account.account_id, new Date(latestBalances.date), lastDateToPredict, curBalance)]
      };
    }
    
    private async getPredictedTransactions(account_id: string, startDate: Date, endDate: Date, balance: number ): Promise< SnapshotBalance[]> {
      const snapshotSettings = this.user.settings.accountSnapshots.find(acct=>acct.account_id === account_id);
      let result: SnapshotBalance[] = [];

      if (!snapshotSettings || !snapshotSettings.scheduledTransactions || snapshotSettings.scheduledTransactions.length === 0) {
        return result;
      }

      const validDates: Date[] = this.getDateRange(startDate, endDate);

      for (const date of validDates) {
        const scheduledOnThisDate =snapshotSettings.scheduledTransactions.filter(sett=> sett.date === date.getDate());
        for (const scheduled of scheduledOnThisDate) {
          switch(scheduled.type) {
            case "adjustment":
              balance += scheduled.amount;
              result.push(SnapshotBalance.build(date, balance, scheduled.amount, scheduled.description, true));
              break;
            case "transfer":
              const txnAmount = await this.predictTransferAmount(scheduled, date);
              balance += txnAmount;
              result.push(SnapshotBalance.build(date, balance, txnAmount,  scheduled.description, true));
              break;
          }
        }
      }

      return result;
  }

  private async predictTransferAmount(setting: AccountSnapshotScheduledTransactionsSettings, date: Date): Promise<number> {
    const estimatedStatementDate = new Date(date);
    estimatedStatementDate.setDate(estimatedStatementDate.getDate() - setting.gracePeriod);

    const linkedAccount = this.user.banks.filter(b=>b.accounts)
      .find(b=>b.accounts.map(a=>a.account_id).indexOf(setting.linked_account_id)>=0)?.accounts?.find(a=>a.account_id === setting.linked_account_id);

    if (!linkedAccount) {
      return 0;
    }
    const predictedAmount =  await new BalanceDal().calcBalanceOnDate( setting.linked_account_id, estimatedStatementDate, linkedAccount.type);
    return predictedAmount;
  }

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  }
}