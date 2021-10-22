# netflow

See individual README files in client and server folders

## Contributors
Feel free to reach out to me at kilativ@gmail.com if you want to contribute or need help using this project. 

## What is this project?
This project is an alernative self-hosted version of mint.com. It uses Plaid API to download account and transaction data from your bank, saves it in the AWS account that you own and allows you browse and do simple analysis and predictions of the future balances.

Unlike Mint.com you own your data and nobody else can use it for any purpose.

## Architecture
Server is deployed as serverless app to AWS via APIGateway/Lambdas and Dynamo DB backend.

Front end is deployed as static website via AWS Amplify. 


## requirements
* node v12

## build

    npm run build

## run

    npm run serve
    http://localhost:8080

### Tailwind NetFlow template
https://www.tailwindtoolbox.com/templates/admin-template-demo.php
### Tailwind Cheat Sheet
https://nerdcave.com/tailwind-cheat-sheet
