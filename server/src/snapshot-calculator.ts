import { SnapshotBalance, SnapshotDto } from '../../shared/models/snapshot-dto';
import { BalanceDal } from './dal/balance-dal';
import { Account } from 'plaid';
import { TransactionDal } from './dal/transactions-dal';

export class SnapshotCalculator {
    async get(account: Account, numOfDays: number):Promise<SnapshotDto> {

        const mult = (account.type === 'credit')? -1: 1;

      
        const accountId = account.account_id
        const balances =  await new BalanceDal().getAllForAccount(accountId);
        const latestBalances= balances.reduce((prev,current)=> (prev.date > current.date)? prev: current);
        const latestBalanceAcount = latestBalances.current * mult;
        let allTxns = await new TransactionDal().getAllForAccount(accountId);
      
        var dateOffset = (24*60*60*1000) * numOfDays;
        const lowerLimitDate = new Date();
        lowerLimitDate.setTime (new Date(latestBalances.date).getTime() - dateOffset);
        allTxns = allTxns.filter(txn=> txn.date < latestBalances.date && new Date(txn.date) >= lowerLimitDate).sort((a,b)=> {return a.date.localeCompare(b.date);});
      
        const sumOfAllAmounts = allTxns.map(txn=>txn.amount).reduce((t1,t2)=>t1+t2, 0);
        const startingBalance = latestBalanceAcount + sumOfAllAmounts;
      
        const results: SnapshotBalance[]= [];
        results.push(SnapshotBalance.build(lowerLimitDate, startingBalance, startingBalance, "balance on " + lowerLimitDate.toDateString(), false));
      
        let curBalance = startingBalance;
        allTxns.forEach (txn=> {
          curBalance = curBalance - txn.amount;
          results.push(SnapshotBalance.build(new Date(txn.date), curBalance, -1 * txn.amount, txn.name, false));
        })
      
        results.push(SnapshotBalance.build(new Date(latestBalances.date), latestBalanceAcount, 0, 'current', false));
 
        

        return {account: account, balances: results};
    }
}