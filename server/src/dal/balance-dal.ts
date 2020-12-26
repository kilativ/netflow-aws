const AWS = require('aws-sdk');
import {BalanceDto} from '../../../shared/models/balance-dto'
import { Formatter } from '../../../shared/utils/formatter';
import { TransactionDal } from './transactions-dal';

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
          resolve(data.Items);
        }
      });
    })
  }
  closestForDate(accountId: string, date: Date): Promise<BalanceDto> {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.BALANCE_DYNAMODB_TABLE,
        KeyConditionExpression: 'account_id = :accountId and #dateAttr >= :dateValue ',
        ExpressionAttributeValues: {
          ":accountId": accountId, 
          ":dateValue": Formatter.toISODateString(date)
        },
        ExpressionAttributeNames: {
          "#dateAttr": "date"
        },
        Limit: 1
      };

      this.dynamoDb.query(params, function (err: any, data: any) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(data.Items[0]);
        }
      });
    })
  }

  async calcBalanceOnDate(accountId: string, date: Date, accountType: string) {
    const balance = await this.closestForDate(accountId, date);
    const txns = await new TransactionDal().getForAccountBetweenDates(accountId, date, new Date(balance.date));

    if (accountType ==='credit') {
      balance.current = -1 * balance.current;
    }
    return balance.current + txns.map(txn=> txn.amount).reduce((prev, curr)=> curr+prev, 0);
  }
}

