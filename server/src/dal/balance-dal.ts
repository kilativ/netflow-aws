const AWS = require('aws-sdk');
import {BalanceDto} from '../../../shared/models/balance-dto'

export class BalanceDal {
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  update(balance: BalanceDto) {
    // todo make insert in bulk

    const params = {
      TableName: process.env.BALANCE_DYNAMODB_TABLE,
      Item: balance
    };

    this.dynamoDb.put(params, (error: any, result: any) => {
      if (error) {
        console.error(error);
        return;
      }
    });
  }

  getAllForDate(date: Date): Promise<BalanceDto> {
    throw new Error("not implemented");
  }


  getAllForAccount(accountId: string): Promise<BalanceDto[]> {
    // todo can be made generic for any table with accountId
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.BALANCE_DYNAMODB_TABLE,
        KeyConditionExpression: 'account_id = :accountId',
        ExpressionAttributeValues: {
          ":accountId": accountId
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

