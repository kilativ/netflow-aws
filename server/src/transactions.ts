import { AccountDal } from './dal/account-dal';
import { BalanceDal } from './dal/balance-dal';
import { TransactionDal } from './dal/transactions-dal';
import { Account, PlaidError, Transaction } from 'plaid';
import { PlaidDal } from './plaid-dal';
import { BalanceDto } from '../../shared/models/balance-dto';
import { Formatter } from '../../shared/utils/formatter';
import { NetFlowPlaidBankLink } from '../../shared/models/account-dto';
import dayjs from 'dayjs';

interface GetTxnResultAndError {
    [key: string]: Transaction[] | PlaidError;
}
interface ResultsByUser {
    [key: string]: GetTxnResultAndError;
}


export class Transactions {
    transactionDal: TransactionDal;
    plaidDal: PlaidDal;
    balanceDal: BalanceDal;

    constructor(private accountDal:AccountDal) {
        this.transactionDal = new TransactionDal();
        this.plaidDal = new PlaidDal();
        this.balanceDal = new BalanceDal();
    }

    async saveToDb(numOfDays: number) : Promise<ResultsByUser>{
        let startDate = dayjs().subtract(numOfDays, 'days').toDate();
        let todayObj = new Date();
        console.log('saveToDb job');
        const netFlowUsers = await this.accountDal.getAll();
        console.log(`got ${netFlowUsers.length} users`);

        const today = Formatter.toISODateString(todayObj);
        console.log(`retrieval dates between ${Formatter.toISODateString(startDate)} and ${today}`);

        // let newTransactions: Transaction[] = [];
        let result : ResultsByUser  = {};

        for (const user of netFlowUsers) {
            let trxnsAndErrors: GetTxnResultAndError = {};
            result[user.userId] = trxnsAndErrors;

            if (user.banks) {
                for (const bank of user.banks) {
                    let allTransactionsIds: string[] = [];
                    for (const acct of bank.accounts) {
                        let existingTxns = await this.transactionDal.getForAccountBetweenDates(acct.account_id,startDate, todayObj);
                        allTransactionsIds.push(...existingTxns.map(txn=>txn.transaction_id));
                    }
                    try {
                        let txnsAndAccounts = await this.processUserBank(user.userId, bank, today, numOfDays);
                        trxnsAndErrors[bank.nickname] = txnsAndAccounts[1].filter(txn=>allTransactionsIds.indexOf(txn.transaction_id)< 0)
                    } catch(e) {
                        console.log(`Error for account ${bank.nickname}: ${e}`);
                        trxnsAndErrors[bank.nickname] = e;
                    }
                }
            }
        }

        return result;
    }

    public async processUserBank(userId: string, bank: NetFlowPlaidBankLink, today: string, numberOfDays = 7): Promise<[ Account[], Transaction[]]> {
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

        return [txnsAndAccounts.accounts, txnsAndAccounts.transactions];
    }
}
