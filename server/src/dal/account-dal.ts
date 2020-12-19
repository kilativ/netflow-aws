const AWS = require('aws-sdk');
import { NetFlowUser } from '../../../shared/models/account-dto'
import {Account} from 'plaid';

export class AccountDal {
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  addUser(account: NetFlowUser) {
    // todo convert to promise
    const params = {
      TableName: process.env.ACCT_DYNAMODB_TABLE,
      Item: account
    };

    this.dynamoDb.put(params, (error: any, result: any) => {
      if (error) {
        console.error(error);
        return;
      }
    });
  }

  async updateBankAccounts (userId: string, bankId: string, accounts: Account[]) {
    const user = await this.get(userId);
    const indexToUpdate = user.banks.map(bank => bank.id).indexOf(bankId);

    const bank = user.banks[indexToUpdate];
    if (bank) {
      const existingAccounts = bank.accounts ?? [];
      const newAccountIds = accounts.map(acct=>acct.account_id);
      const notToUpdateAccounts = existingAccounts.filter(acct=> newAccountIds.indexOf(acct.account_id)<0);

      bank.accounts = [...notToUpdateAccounts, ...accounts];
    }
    
    const params = {
      TableName: process.env.ACCT_DYNAMODB_TABLE,
      Key: {
        "userId": userId
      },
      UpdateExpression : `SET banks[${indexToUpdate}].accounts = :accounts`,
      ConditionExpression: `banks[${indexToUpdate}].id = :bankId`,
      ExpressionAttributeValues : {
        ":accounts" : accounts,
        ":bankId": bankId
      }
    };
    this.dynamoDb.update(params, function(err:any, data: any) {
      if (err) {
        console.error(err);
      }
      console.log(data);
    })
  }
  

  getAll(): Promise<NetFlowUser[]> {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.ACCT_DYNAMODB_TABLE,
      };

      this.dynamoDb.scan(params, function (err: any, data: any) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    })
  }

  get(userId: string): Promise<NetFlowUser> {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.ACCT_DYNAMODB_TABLE,
        Key: {
          "userId": userId
        }
      };

      this.dynamoDb.get(params, function (err: any, data: any) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Item);
        }
      });
    })
  }
}

