import moment from 'moment';
import plaid, { TokenResponse, TransactionsResponse,Institution } from 'plaid';

export class PlaidDal {
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

      exchangePublicToken(publicToken: any) {
        return new Promise<TokenResponse>((resolve, reject)=> {
          this.client.exchangePublicToken(publicToken, function (error, tokenResponse) {
            if (error != null) {
              reject(error);
            }
            resolve(tokenResponse);
          });
        })
      }

          
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
    
    
    public async fetchTransactions(accessToken: string): Promise<TransactionsResponse> {
        let startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
        let endDate = moment().format('YYYY-MM-DD');

        const originalResponse = await this.client.getTransactions(accessToken, startDate, endDate, {});
        let transactions = originalResponse.transactions;
        const total_transactions = originalResponse.total_transactions;
      
        while (transactions.length < total_transactions) {
          const paginatedTransactionsResponse = await this.client.getTransactions(accessToken, startDate, endDate,
            {
              offset: transactions.length,
            },
          );
          transactions = transactions.concat(
            paginatedTransactionsResponse.transactions
          );
        }

        originalResponse.transactions = transactions;
        return originalResponse;
    }

    public getBankInfo(accessToken: string):Promise<Institution> {

      const plaidClient = this.client;
      return new Promise<Institution>((resolve, reject)=> {
        plaidClient.getItem(accessToken, function (error, itemResponse) {
          if (error != null) {
            reject(error);
          }
          plaidClient.getInstitutionById(itemResponse.item.institution_id, function (err:any, instRes:any) {
            if (err != null) {
              reject(err);
            } else {
              resolve(instRes.institution);
            }
          });
        });
      })

    }
}