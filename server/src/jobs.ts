import dotenv from 'dotenv';
import { Transaction,PlaidError } from 'plaid';
import { AccountDal } from './dal/account-dal';
import { Transactions,  } from './transactions';

export class Jobs {
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

    async getDailyTransactions(numOfDays: number):Promise<void> {
        let results = await new Transactions(new AccountDal()).saveToDb(numOfDays);

        for (var userId in results) {
            let emailBody = "<h2>Daily Transactions</h2>";
            let txnAndErrors = results[userId];
    
            for(var bankName in txnAndErrors) {
                let currentBank = txnAndErrors[bankName];
                if (Array.isArray(currentBank)){
                    let txns: Transaction[] = currentBank;
                    emailBody += `<h3>${bankName}</h3>${this.txnsToHtml(txns)}`;
                } else {
                    let error: PlaidError = currentBank;
                    emailBody += `<h3>${bankName}</h3>${error.error_message}`;
                }
            }

            await this.sendEmail(userId, "Daily Transactions", emailBody);
        }
    }

    txnsToHtml(txns: Transaction[]) : string {
        let result = "<table><tr><td>Date</td><td>Name</td><td>Amount</td><td>Category</td></tr>"

        txns.forEach(txn=> {
            result += `<tr><td>${txn.date}</td><td>${txn.merchant_name}(${txn.name})</td><td>${txn.amount} ${txn.iso_currency_code}</td><td>${txn?.category.join(',')}</td></tr>`
        })

        return result + "</table>"
    }

    sendEmail(email: string, subject: string, body: string): Promise<void>{
        var params = {
            Destination: {
              ToAddresses: [email],
            },
            Message: {
              Body: {
                Html: {
                    Data: body
                },
              },
        
              Subject: { Data: subject },
            },
            Source: process.env.FROM_EMAIL,
          };
         
          return ses.sendEmail(params).promise();
    }

}

dotenv.config();
var aws = require("aws-sdk");
var ses = new aws.SES({ region: process.env.AWS_REGION });

export const handler = async (event: any = {}): Promise<any> => {
    dotenv.config();
    await new Jobs().getDailyTransactions(7);
    return "All Good";
}

// (async () => {
//     const result = await handler({ foo: 'bar' });
//     console.log(result);
// })();