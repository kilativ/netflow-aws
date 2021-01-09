const AWS = require('aws-sdk');
import { NetFlowUser } from '../../../shared/models/account-dto'
import { Account } from 'plaid';

export class AccountDal {
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  addBankToUser(userId: string, access_token: string) {
    return new Promise(async (resolve, reject) => {
      await this.createAttributeIfDoesNotExist(userId, 'banks');
      const params = {
        TableName: process.env.ACCT_DYNAMODB_TABLE,
        Key: { userId: userId },
        UpdateExpression: "SET #bank = list_append(#bank, :vals)",
        ExpressionAttributeNames: {
          "#bank": "banks"
        },
        ExpressionAttributeValues: {
          ":vals": [{ nickname: 'todo', active: true, token: access_token }]
        },
        ReturnValues: "UPDATED_NEW"
      };

      this.dynamoDb.update(params, (err: any, result: any) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(result)
        }
      });
    })
  }

  createAttributeIfDoesNotExist(userId: string, attributeName: string) {
    return new Promise((resolve, reject) => {
      this.dynamoDb.update({
        TableName: process.env.ACCT_DYNAMODB_TABLE,
        Key: { userId: userId },
        UpdateExpression: 'SET #a = :vals',
        ConditionExpression: 'attribute_not_exists(#a)',
        ExpressionAttributeNames: {
          '#a': attributeName
        },  ExpressionAttributeValues: {
          ":vals": []
        },
      }, (err: any, result: any) => {
        if (err) {
          if (err.code === 'ConditionalCheckFailedException') {
            resolve(null);
          } else  {
            console.log(err);
            reject(err);
          }

        } else {
          resolve(result)
        }
      })
    });
  }

  addUser(account: NetFlowUser): Promise<NetFlowUser> {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: process.env.ACCT_DYNAMODB_TABLE,
        Item: account
      };

      this.dynamoDb.put(params, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(account)
        }
      });
    })
  }

  async updateBankAccounts(userId: string, bankId: string, accounts: Account[]) {
    const user = await this.get(userId);
    const indexToUpdate = user.banks.map(bank => bank.id).indexOf(bankId);

    const bank = user.banks[indexToUpdate];
    if (bank) {
      const existingAccounts = bank.accounts ?? [];
      const newAccountIds = accounts.map(acct => acct.account_id);
      const notToUpdateAccounts = existingAccounts.filter(acct => newAccountIds.indexOf(acct.account_id) < 0);

      bank.accounts = [...notToUpdateAccounts, ...accounts];
    }

    const params = {
      TableName: process.env.ACCT_DYNAMODB_TABLE,
      Key: {
        "userId": userId
      },
      UpdateExpression: `SET banks[${indexToUpdate}].accounts = :accounts`,
      ConditionExpression: `banks[${indexToUpdate}].id = :bankId`,
      ExpressionAttributeValues: {
        ":accounts": accounts,
        ":bankId": bankId
      }
    };
    this.dynamoDb.update(params, function (err: any, data: any) {
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

