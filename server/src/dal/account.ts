const AWS = require('aws-sdk'); 

AWS.config.update({
    region: "us-east-1"
  });

export class AccountDal {
    private dynamoDb = new AWS.DynamoDB.DocumentClient();

    update(account: UserAccount) {
  
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

export class UserAccount {
    public userId: string;
    public google: object;
}