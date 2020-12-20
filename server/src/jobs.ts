import dotenv from 'dotenv';
import { AccountDal } from './dal/account-dal';
import { BalanceDal } from './dal/balance-dal';
import { TransactionDal } from './dal/transactions-dal';
import {PlaidDal} from './plaid-dal'
import {BalanceDto} from '../../shared/models/balance-dto'

export class Transactions {
    async saveToDb() {
        const accountDal = new AccountDal();
        const netFlowUsers = await accountDal.getAll();

        const transactionDal = new TransactionDal()
        const plaidDal = new PlaidDal();
        const balanceDal = new BalanceDal();
        const today = new Date().toISOString().substring(0,10); 
        netFlowUsers.forEach(async user => 
            user.banks.forEach(async bank => {
                const txnsAndAccounts = await plaidDal.fetchTransactions(bank.token); 

                txnsAndAccounts.transactions.forEach(txn=>transactionDal.update(txn));

                const accounts = txnsAndAccounts.accounts;
                accountDal.updateBankAccounts(user.userId, bank.id, accounts);

                accounts.forEach(acct=> {
                    const balance = acct.balances as BalanceDto;
                    balance.account_id = acct.account_id;
                    balance.date = today;

                    balanceDal.update(balance);
                })
            })
        )

    }
}

dotenv.config();
new Transactions().saveToDb();
