import dotenv from 'dotenv';
import { AccountDal } from './dal/account-dal';
import { BalanceDal } from './dal/balance-dal';
import { TransactionDal } from './dal/transactions-dal';
import { PlaidDal } from './plaid-dal'
import { BalanceDto } from '../../shared/models/balance-dto'
import { Formatter } from '../../shared/utils/formatter';

export class Transactions {
    async saveToDb() {
        console.log('saveToDb job');
        const accountDal = new AccountDal();
        const netFlowUsers = await accountDal.getAll();
        console.log(`got ${netFlowUsers.length} users`);

        const transactionDal = new TransactionDal()
        const plaidDal = new PlaidDal();
        const balanceDal = new BalanceDal();
        const today = Formatter.toISODateString(new Date());
        console.log(`retrieval date ${today}`);

        for (const user of netFlowUsers) {
            for (const bank of user.banks) {
                console.log(`processing user ${user.userId}, bank ${bank.id}`);

                const txnsAndAccounts = await plaidDal.fetchTransactions(bank.token);
                console.log(`got ${txnsAndAccounts.accounts.length} accounts and ${txnsAndAccounts.transactions.length} transactions from plaid`)

                // don't run it for a lot of transaction until batching is implemented in order not to exceed DynamoDB througput limits
                txnsAndAccounts.transactions.forEach(txn => transactionDal.update(txn));
                console.log('updated transactions in dynamodb');

                const accounts = txnsAndAccounts.accounts;
                accountDal.updateBankAccounts(user.userId, bank.id, accounts);
                console.log('updated banks in user object in dynamodb');

                accounts.forEach(acct => {
                    const balance = acct.balances as BalanceDto;
                    balance.account_id = acct.account_id;
                    balance.date = today;

                    balanceDal.update(balance);
                })
                console.log('updated balances object in dynamodb');
            }
            
        }
    }
}

export class Maintennce {
    copyDynamoDbTables() {
        var copy = require('copy-dynamodb-table').copy

        copy({
            source: {
                tableName: 'netflow-transaction-dev', // required
            },
            destination: {
                tableName: 'netflow-transaction-vr', // required
            },
            log: true, // default false
            create: true, // create destination table if not exist
            schemaOnly: true // if true it will copy schema only -- optional
        },
            function (err: any, result: any) {
                if (err) {
                    console.log(err)
                }
                console.log(result)
            })
    }
}

dotenv.config();
new Transactions().saveToDb();
// new Maintennce().copyDynamoDbTables();


export const handler = async (event: any = {}): Promise<any> => {
    dotenv.config();
    await new Transactions().saveToDb();
    return "All Good";
}