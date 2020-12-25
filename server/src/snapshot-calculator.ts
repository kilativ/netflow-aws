import { SnapshotBalance, SnapshotDto } from '../../shared/models/snapshot-dto';
import { BalanceDal } from './dal/balance-dal';
import { Account} from 'plaid';
import { TransactionDal } from './dal/transactions-dal';
import { AccountDal } from './dal/account-dal';

export class SnapshotCalculator {
    async get(account: Account, numOfDays: number, numOfDaysToPredict: number, userId: string):Promise<SnapshotDto> {

      const results: SnapshotBalance[]= [];
      const mult = (account.type === 'credit')? -1: 1;

      const accountId = account.account_id
      const balances =  await new BalanceDal().getAllForAccount(accountId);
      const latestBalances= balances.reduce((prev,current)=> (prev.date > current.date)? prev: current);
      const latestBalanceAcount = latestBalances.current * mult;
      let allTxns = await new TransactionDal().getAllForAccount(accountId);
    
      const lowerLimitDate = new Date(latestBalances.date);
      lowerLimitDate.setDate(lowerLimitDate.getDate() - numOfDays);

      allTxns = allTxns.filter(txn=> txn.date < latestBalances.date && new Date(txn.date) >= lowerLimitDate).sort((a,b)=> {return a.date.localeCompare(b.date);});
    
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
        balances:  [... results, ... await this.getPredictedTransactions(account.account_id, userId, new Date(latestBalances.date), lastDateToPredict, curBalance)]
      };
    }
    
    async getPredictedTransactions(account_id: string, userId: string, startDate: Date, endDate: Date, balance: number ): Promise< SnapshotBalance[]> {

      const snapshotSettings = (await new AccountDal().get(userId)).settings.accountSnapshots.find(acct=>acct.account_id === account_id);
      let result: SnapshotBalance[] = [];

      if (!snapshotSettings || !snapshotSettings.scheduledTransactions || snapshotSettings.scheduledTransactions.length === 0) {
        return result;
      }

      const validDates: Date[] = this.getDateRange(startDate, endDate);

      validDates.forEach(date=> {
        const txnOnThisDate =snapshotSettings.scheduledTransactions.filter(sett=> sett.date === date.getDate());
        txnOnThisDate.forEach(setting=> {
          switch(setting.type) {
            case "adjustment":
              balance += setting.amount;
              result.push(SnapshotBalance.build(new Date(date), balance, setting.amount, setting.description, true));
              break;
            case "transfer":
              //todo
              break;
          }
        })
      });

      return result;
    }


  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  }
}