import dotenv from 'dotenv';
import moment from 'moment';
import plaid, { TransactionsResponse } from 'plaid';
import { AccountDal } from './dal/account-dal';
import { TransactionDal } from './dal/transactions-dal';


export class Transactions {
    private PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
    private PLAID_SECRET = process.env.PLAID_SECRET;
    private PLAID_ENV = process.env.PLAID_ENV;

    private  client = new plaid.Client({
        clientID: this.PLAID_CLIENT_ID,
        secret: this.PLAID_SECRET,
        env: plaid.environments[this.PLAID_ENV],
        options: {
          version: '2019-05-29',
        }
      });
    async saveToDb() {
        const accountDal = new AccountDal();
        const netFlowUsers = await accountDal.getAll();

        const transactionDal = new TransactionDal()
        netFlowUsers.forEach(async user => 
            user.banks.forEach(async bank => {
                const txnsAndAccounts = await this.fetchTransactions(bank.token); 

                txnsAndAccounts.transactions.forEach(txn=>transactionDal.update(txn));

                const accounts = txnsAndAccounts.accounts;
                accountDal.updateBankAccounts(user.userId, bank.id, accounts);
            })
        )

    }

    // todo moved to PLAID specific file
    async updateLink(accessToken: string, userId: string) { // call when ITEM_LOGIN_REQUIRED recieved. onse link token generated JavaScript PLaid UI needs to create a popup to re-login
        const linkTokenResponse = await this.client.createLinkToken({
          user: {
            client_user_id: userId,
          },
          client_name: 'NetFlow',
          country_codes: ['US'],
          language: 'en',
          webhook: 'https://webhook.sample.com',
          access_token: accessToken,
        });
      
        console.log(linkTokenResponse)
      }
    
    
    // todo moved to PLAID specific file
    private async fetchTransactions(accessToken: string): Promise<TransactionsResponse> {
        let startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        let endDate = moment().format('YYYY-MM-DD');
        return new Promise((resolve, reject) => {
            this.client.getTransactions(accessToken, startDate, endDate, {
                count: 250,
                offset: 0,
              }, function (error, transactionsResponse) {
                if (error != null) {
                  console.error(error);
                  reject(error);
                } else {
                    resolve(transactionsResponse);
                }
              });
        });
    }
}

dotenv.config();
new Transactions().saveToDb();
