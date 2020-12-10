const AWS = require('aws-sdk'); 
import {NetFlowUser} from '../../../shared/models/account-dto'

export class AccountDal {
    private dynamoDb = new AWS.DynamoDB.DocumentClient();

    update(account: NetFlowUser) {
  
        console.log(account);
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
}

