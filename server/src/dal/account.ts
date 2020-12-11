const AWS = require('aws-sdk');
import { NetFlowUser } from '../../../shared/models/account-dto'

export class AccountDal {
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  update(account: NetFlowUser) {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: account
    };

    // update the todo in the database
    this.dynamoDb.put(params, (error: any, result: any) => {
      if (error) {
        console.error(error);
        return;
      }
    });
  }

  get(userId: string) {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          "userId": userId
        }
      };

      this.dynamoDb.get(params, function (err: any, data: any) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    })
  }
}

