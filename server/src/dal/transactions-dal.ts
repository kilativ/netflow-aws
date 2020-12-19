const AWS = require('aws-sdk');
import { Transaction } from 'plaid';

export class TransactionDal {
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

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

  getAllForAccount(accountId: string): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.TAXN_DYNAMODB_TABLE,
        KeyConditionExpression: 'account_id = :accountId',
        ExpressionAttributeValues: {
          ":accountId": {S: accountId}
        }
      };

      this.dynamoDb.query(params, function (err: any, data: any) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(data);
          resolve(data.Items);
        }
      });
    })
  }
}

