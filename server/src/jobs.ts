import dotenv from 'dotenv';
import { AccountDal } from './dal/account-dal';
import { BalanceDal } from './dal/balance-dal';
import { TransactionDal } from './dal/transactions-dal';
import { PlaidDal } from './plaid-dal'
import { BalanceDto } from '../../shared/models/balance-dto'
import { Formatter } from '../../shared/utils/formatter';

export class Transactions {
    async saveToDb() {
        const accountDal = new AccountDal();
        const netFlowUsers = await accountDal.getAll();

        const transactionDal = new TransactionDal()
        const plaidDal = new PlaidDal();
        const balanceDal = new BalanceDal();
        const today = Formatter.toISODateString(new Date());
        netFlowUsers.forEach(async user =>
            user.banks.forEach(async bank => {
                const txnsAndAccounts = await plaidDal.fetchTransactions(bank.token);

                // don't run it for a lot of transaction until batching is implemented in order not to exceed DynamoDB througput limits
                txnsAndAccounts.transactions.forEach(txn => transactionDal.update(txn));

                const accounts = txnsAndAccounts.accounts;
                accountDal.updateBankAccounts(user.userId, bank.id, accounts);

                accounts.forEach(acct => {
                    const balance = acct.balances as BalanceDto;
                    balance.account_id = acct.account_id;
                    balance.date = today;

                    balanceDal.update(balance);
                })
            })
        )

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
