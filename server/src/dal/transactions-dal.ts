const AWS = require('aws-sdk');
import dayjs from 'dayjs';
import { Transaction, TransactionsResponse } from 'plaid';
import { NetflowTransaction } from '../../../shared/models/netflow-transaction';
import { Formatter } from '../../../shared/utils/formatter';

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

  async updateMultiple(txnsAndAccounts: TransactionsResponse, userId: string) {

    const transactions = txnsAndAccounts.transactions;
    transactions.forEach(txn => {
      const netflowTxn = txn as NetflowTransaction;
      netflowTxn.userId = userId;
      netflowTxn.account_name = txnsAndAccounts.accounts.find(acct=>acct.account_id === txn.account_id).name;
      netflowTxn.search_string = txn.name.toLowerCase();
    });


    var arrSize = transactions.length;
    let chunk:Transaction[];
    const chunkSize = 25;

    let param = new TxnBatchWriteParam();
    param.RequestItems = {};

    for (let i = 0; i < arrSize; i += chunkSize) {
      chunk = transactions.slice(i, i + chunkSize);
  
      param.RequestItems[process.env.TAXN_DYNAMODB_TABLE] = chunk.map(txn=> {
        const requestItem: TxnRequestItem = {PutRequest: {Item: txn}};
        return requestItem;
      });

      await this.dynamoDb.batchWrite(param, (err:any, data:any) => {
        if (err) {
          console.error(err);
        } else {
          console.log(data);
        }
      });
    }
  }

  getAllForUser(userId: string, startDate: Date, endDate: Date, searchTerm:string = null): Promise<NetflowTransaction[]> {
    return new Promise(async (resolve, reject) => {

      const params = {
        TableName: process.env.TAXN_DYNAMODB_TABLE,
        ScanIndexForward: false,
        IndexName: 'user-by-date',
        KeyConditionExpression: '#kn0 = :kv0 AND #kn1 BETWEEN :kv1 AND :kv1p2',
        ExpressionAttributeNames: {
          "#kn0": "userId",
          "#kn1": "date"
        },
        ExpressionAttributeValues : {
        ":kv0":userId,
        ":kv1": dayjs(startDate).format('YYYY-MM-DD'),
        ":kv1p2": dayjs(endDate).format('YYYY-MM-DD'), 
        }
      };

      if (searchTerm) {
        const paramsAny = params as any;

        paramsAny.FilterExpression = "contains(#n0, :v0)";
        paramsAny.ExpressionAttributeNames["#n0"] = "search_string";
        paramsAny.ExpressionAttributeValues[":v0"] = searchTerm.toLowerCase();
      }

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

class TxnBatchWriteParam {
  RequestItems: { [tableName: string]: TxnRequestItem[] }; 
}

class TxnRequestItem {
  PutRequest?: TxnItem;
  DeleteRequest?: TxnItem
}

class TxnItem {
  Item: Transaction
}