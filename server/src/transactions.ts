import { AccountDal } from './dal/account-dal';
import { BalanceDal } from './dal/balance-dal';
import { TransactionDal } from './dal/transactions-dal';
import { PlaidDal } from './plaid-dal';
import { BalanceDto } from '../../shared/models/balance-dto';
import { Formatter } from '../../shared/utils/formatter';
import { NetFlowPlaidBankLink } from '../../shared/models/account-dto';


export class Transactions {
    transactionDal: TransactionDal;
    plaidDal: PlaidDal;
    balanceDal: BalanceDal;

    constructor(private accountDal:AccountDal) {
        this.transactionDal = new TransactionDal();
        this.plaidDal = new PlaidDal();
        this.balanceDal = new BalanceDal();
    }

    async saveToDb() {
        console.log('saveToDb job');
        const netFlowUsers = await this.accountDal.getAll();
        console.log(`got ${netFlowUsers.length} users`);

        const today = Formatter.toISODateString(new Date());
        console.log(`retrieval date ${today}`);

        for (const user of netFlowUsers) {
            if (user.banks) {
                for (const bank of user.banks) {
                    await this.processUserBank(user.userId, bank, today);
                }
            }
        }
    }

    public async processUserBank(userId: string, bank: NetFlowPlaidBankLink, today: string, numberOfDays = 7): Promise<[number, number]> {
        console.log(`processing user ${userId}, bank ${bank.id}`);

        const txnsAndAccounts = await this.plaidDal.fetchTransactions(bank.token, numberOfDays);
        console.log(`got ${txnsAndAccounts.accounts.length} accounts and ${txnsAndAccounts.transactions.length} transactions from plaid`);

        this.transactionDal.updateMultiple(txnsAndAccounts, userId);
        console.log('updated transactions in dynamodb');

        const accounts = txnsAndAccounts.accounts;
        this.accountDal.updateBankAccounts(userId, bank.id, accounts);
        console.log('updated banks in user object in dynamodb');

        accounts.forEach(acct => {
            const balance = acct.balances as BalanceDto;
            balance.account_id = acct.account_id;
            balance.date = today;

            this.balanceDal.update(balance);
        });
        console.log('updated balances object in dynamodb');

        return [txnsAndAccounts.accounts.length, txnsAndAccounts.transactions.length];
    }
}
