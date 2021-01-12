import dotenv from 'dotenv';
import { AccountDal } from './dal/account-dal';
import { Transactions } from './transactions';

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
new Transactions(new AccountDal()).saveToDb();
// new Maintennce().copyDynamoDbTables();


export const handler = async (event: any = {}): Promise<any> => {
    dotenv.config();
    await new Transactions(new AccountDal()).saveToDb();
    return "All Good";
}