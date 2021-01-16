# server

https://github.com/microsoft/TypeScript-Node-Starter

https://medium.com/the-andela-way/how-to-set-up-an-express-api-using-webpack-and-typescript-69d18c8c4f52

https://github.com/plaid/quickstart.git

## Setup

### AWS Setup

#### IAM

#### Dynamo DB
Right now you need to create 3 tables in AWS DynamoDB
* TODO


## environment
copy .env.sample to .env and set all variables from the sample to your sandbox tokens

## running
    npm install
    npm run build
    npm run watch

Connect to http://localhost:3000

Build artifacts are in dist/


## Deploy to AWS

### Install Claudia.js
Follow https://claudiajs.com/tutorials/installing.html to install Claudia.js and setup AWS credentials

### Environment
Copy `lambda-env.json.sample` to  `lambda-env.json` and populate it with your environment settings. Not that AWS keys are not needed.

### Create serverless install
* Execute 
```
npm run build-ts
npm run claudia-create
```

This will create an execution user, api gateway and lambda for your app. Once complete it will print out the URL of your new serverless API. 

* Remember to update your google OAuth Authorized redirect URIs with the URL you just recieved. (to test this)
* Login to AWS IAM and grant newly created `server-executor` role full permission to NetFlow three tables in Dynamo DB

### Update serverless install
* Execute 
```
npm run build-ts
npm run claudia-update
```

### Uninstall AWS
run 
```shell
claudia destroy
```
