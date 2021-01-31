const AWS = require('aws-sdk');
import { Transaction } from 'plaid';
import { TransactionWithAccount } from '../../../shared/models/transaction-with-account';
import { Formatter } from '../../../shared/utils/formatter';
import { AccountDal } from './account-dal';

export class TransactionDal {
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  getForAccountBetweenDates(accountId: string, dateFrom: Date, dateTo: Date) : Promise<Transaction[]>{
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.TAXN_DYNAMODB_TABLE,
        IndexName: 'account-by-date',
        KeyConditionExpression: 'account_id = :accountId and #dateAttrName between :dateFrom and :dateTo',
        ExpressionAttributeValues: {
          ":accountId": accountId,
          ":dateFrom": Formatter.toISODateString(dateFrom),
          ":dateTo": Formatter.toISODateString(dateTo),
        }, 
        ExpressionAttributeNames: {
          '#dateAttrName': 'date'
        }
      };

      // todo check if alld ata was returned
      this.dynamoDb.query(params, function (err: any, data: any) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    })
  }


  update(transaction: Transaction) {
    // todo make insert in bulk
    // var arrSize = entities.length, chunk, chunkSize = 25;

    // for (let i = 0; i < arrSize; i += chunkSize) {
    //   console.log(`Chunk ${i} for table ${tablename}`);
    //   chunk = entities.slice(i, i + chunkSize);
  
    //   var params = { RequestItems: {} };
    //   params.RequestItems[tablename] = chunk.map((entity) => {
    //     return { PutRequest: { Item: entity } }
    //   });
  
    //   await  docClient.batchWrite(params, function (err, data);
    // }

    const params = {
      TableName: process.env.TAXN_DYNAMODB_TABLE,
      Item: transaction
    };

    this.dynamoDb.put(params, (error: any, result: any) => {
      if (error) {
        console.error(error);
        return;
      }
    });
  }

  getAllForUser(userId: string): Promise<TransactionWithAccount[]> {

    // in multi-user environment better to tag transaction with user and index on user/date

    return new Promise(async (resolve, reject) => {
      const banks = await (await new AccountDal().get(userId)).banks;
      const allAccounts = banks.map(b=>b.accounts).reduce( (prev, curr)=> prev.concat(curr),[]);

      let filterExpression:string[] = [];
      let attributeValues: { [x: string]: any; } = {};

      allAccounts.forEach((acct, index)=> {
        const key = `:accountId${index}`;
        filterExpression.push(key);
        attributeValues[key] = acct.account_id;
      })

      const params = {
        TableName: process.env.TAXN_DYNAMODB_TABLE,
        ScanIndexForward: false,
        FilterExpression: `account_id in (${filterExpression.join(',')})`,
        ExpressionAttributeValues: attributeValues,
      };

      this.dynamoDb.scan(params, function (err: any, data: any) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const results:TransactionWithAccount[] = data.Items.sort((a:TransactionWithAccount, b:TransactionWithAccount)=> {return b.date.localeCompare(a.date);});
          results.forEach(txn=> txn.account_name = allAccounts.find(acct=> acct.account_id === txn.account_id).name);
          resolve(results);
        }
      });
    })
  }

  getAllForAccount(accountId: string): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.TAXN_DYNAMODB_TABLE,
        IndexName: 'account-by-date',
        // Limit:pageSize,
        ScanIndexForward: false,
        KeyConditionExpression: 'account_id = :accountId',
        ExpressionAttributeValues: {
          ":accountId": accountId
        },
      };

      // todo check if alld ata was returned
      this.dynamoDb.query(params, function (err: any, data: any) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    })
  }
}