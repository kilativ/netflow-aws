import express from 'express';
import dayjs from 'dayjs';
import plaid from 'plaid';
import util from 'util';
import { AccountDal } from './dal/account-dal';
import { RouteValidation } from './utils/route-valdiation';

export class PlaidRoutes {

  public static Add(app: express.Express) {

    let PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
    let PLAID_SECRET = process.env.PLAID_SECRET;
    let PLAID_ENV = process.env.PLAID_ENV;
    let PLAID_PRODUCTS = process.env.PLAID_PRODUCTS.split(',');
    let PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES.split(',');
    let PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI;

    // We store the access_token in memory - in production, store it in a secure
    // persistent data store
    let ACCESS_TOKEN: string = null;
    let PUBLIC_TOKEN: string = null;
    let ITEM_ID: string = null;
    // The payment_id is only relevant for the UK Payment Initiation product.
    // We store the payment_id in memory - in production, store it in a secure
    // persistent data store
    let PAYMENT_ID: string = null;
    let CLIENT_NAME = "netflow";

    // Initialize the Plaid client
    // Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
    let client = new plaid.Client({
      clientID: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      env: plaid.environments[PLAID_ENV],
      options: {
        version: '2019-05-29',
      }
    });

    app.post('/api/info', function (request, response, next) {
      response.json({
        item_id: ITEM_ID,
        access_token: ACCESS_TOKEN,
        products: PLAID_PRODUCTS
      })
    });

    // Create a link token with configs which we can then use to initialize Plaid Link client-side.
    // See https://plaid.com/docs/#create-link-token
      app.post('/api/create_link_token',RouteValidation.validateUser, function (request:any, response, next) {
      const configs = {
        'user': {
          // This should correspond to a unique id for the current user.
          'client_user_id': this.userIdToClientId(request.user),
        },
        'client_name': CLIENT_NAME,
        'products': PLAID_PRODUCTS,
        'country_codes': PLAID_COUNTRY_CODES,
        'language': "en",
        'redirect_uri': '',
      }

      if (PLAID_REDIRECT_URI !== '') {
        configs.redirect_uri = PLAID_REDIRECT_URI;
      }

      client.createLinkToken(configs, function (error, createTokenResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        response.json(createTokenResponse);
      })
    });

    // Create a one-time use link_token for the Item.
    // This link_token can be used to initialize Link
    // in update mode for the user
    app.post('/api/create_relink_token', RouteValidation.validateUser, async (request:any, response, next) => {
      let dal = new AccountDal();
      let userid = request.user as string;
      let user = await dal.get(userid);
      const bankFound = user.banks.find(b=>b.id === request.body.bankId);
      try {
      const linkTokenResponse = await client.createLinkToken({
        user: {
          client_user_id: this.userIdToClientId(userid),
        },
        client_name: CLIENT_NAME,
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en',
        // webhook: 'https://webhook.sample.com',
        access_token: bankFound.token,
      });
      response.json({ link_token: linkTokenResponse.link_token });
    } catch(e) {
      response.status(500);
      response.send(e);
    }

      // Use the link_token to initialize Link
    });
    // Create a link token with configs which we can then use to initialize Plaid Link client-side.
    // See https://plaid.com/docs/#payment-initiation-create-link-token-request
    app.post('/api/create_link_token_for_payment', function (request, response, next) {
      client.createPaymentRecipient(
        'Harry Potter',
        'GB33BUKB20201555555555',
        {
          'street': ['4 Privet Drive'],
          'city': 'Little Whinging',
          'postal_code': '11111',
          'country': 'GB'
        },
        function (error, createRecipientResponse) {
          let recipientId = createRecipientResponse.recipient_id

          client.createPayment(
            recipientId,
            'payment_ref',
            {
              'value': 12.34,
              'currency': 'GBP'
            },
            function (error, createPaymentResponse) {
              prettyPrintResponse(createPaymentResponse)
              let paymentId = createPaymentResponse.payment_id
              PAYMENT_ID = paymentId;
              const configs = {
                'user': {
                  // This should correspond to a unique id for the current user.
                  'client_user_id': 'user-id',
                },
                'client_name': CLIENT_NAME,
                'products': PLAID_PRODUCTS,
                'country_codes': PLAID_COUNTRY_CODES,
                'language': "en",
                'payment_initiation': {
                  'payment_id': paymentId
                },
                'redirect_uri': '',
              };
              if (PLAID_REDIRECT_URI !== '') {
                configs.redirect_uri = PLAID_REDIRECT_URI;
              }
              client.createLinkToken(
                {
                  'user': {
                    // This should correspond to a unique id for the current user.
                    'client_user_id': 'user-id',
                  },
                  'client_name': CLIENT_NAME,
                  'products': PLAID_PRODUCTS,
                  'country_codes': PLAID_COUNTRY_CODES,
                  'language': "en",
                  'redirect_uri': PLAID_REDIRECT_URI,
                  'payment_initiation': {
                    'payment_id': paymentId
                  }
                }, function (error, createTokenResponse) {
                  if (error != null) {
                    prettyPrintResponse(error);
                    return response.json({
                      error: error,
                    });
                  }
                  response.json(createTokenResponse);
                })
            }
          )
        }
      )
    });

    // Exchange token flow - exchange a Link public_token for
    // an API access_token
    // https://plaid.com/docs/#exchange-token-flow
    app.post('/api/set_access_token', function (request, response, next) {
      PUBLIC_TOKEN = request.body.public_token;
      client.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        ACCESS_TOKEN = tokenResponse.access_token;
        ITEM_ID = tokenResponse.item_id;
        prettyPrintResponse(tokenResponse);
        response.json({
          access_token: ACCESS_TOKEN,
          item_id: ITEM_ID,
          error: null,
        });
      });
    });

    // Retrieve an Item's accounts
    // https://plaid.com/docs/#accounts
    app.get('/api/accounts', function (request, response, next) {
      client.getAccounts(ACCESS_TOKEN, function (error, accountsResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        prettyPrintResponse(accountsResponse);
        response.json(accountsResponse);
      });
    });

    // Retrieve ACH or ETF Auth data for an Item's accounts
    // https://plaid.com/docs/#auth
    app.get('/api/auth', function (request, response, next) {
      client.getAuth(ACCESS_TOKEN, function (error, authResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        prettyPrintResponse(authResponse);
        response.json(authResponse);
      });
    });

    // Retrieve Transactions for an Item
    // https://plaid.com/docs/#transactions
    app.get('/api/transactions', function (request, response, next) {
      // Pull transactions for the Item for the last 30 days
      let startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
      let endDate = dayjs().format('YYYY-MM-DD');
      client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
        count: 250,
        offset: 0,
      }, function (error, transactionsResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error
          });
        } else {
          prettyPrintResponse(transactionsResponse);
          response.json(transactionsResponse);
        }
      });
    });

    // Retrieve Identity for an Item
    // https://plaid.com/docs/#identity
    app.get('/api/identity', function (request, response, next) {
      client.getIdentity(ACCESS_TOKEN, function (error, identityResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        prettyPrintResponse(identityResponse);
        response.json({ identity: identityResponse.accounts });
      });
    });

    // Retrieve real-time Balances for each of an Item's accounts
    // https://plaid.com/docs/#balance
    app.get('/api/balance', function (request, response, next) {
      client.getBalance(ACCESS_TOKEN, function (error, balanceResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        prettyPrintResponse(balanceResponse);
        response.json(balanceResponse);
      });
    });


    // Retrieve Holdings for an Item
    // https://plaid.com/docs/#investments
    app.get('/api/holdings', function (request, response, next) {
      client.getHoldings(ACCESS_TOKEN, function (error, holdingsResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        prettyPrintResponse(holdingsResponse);
        response.json({ error: null, holdings: holdingsResponse });
      });
    });

    // Retrieve Investment Transactions for an Item
    // https://plaid.com/docs/#investments
    app.get('/api/investment_transactions', function (request, response, next) {
      let startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
      let endDate = dayjs().format('YYYY-MM-DD');
      client.getInvestmentTransactions(ACCESS_TOKEN, startDate, endDate)
        .then(investmentTransactionsResponse => {
          prettyPrintResponse(investmentTransactionsResponse);
          response.json({ error: null, investment_transactions: investmentTransactionsResponse });
        })
        .catch(error => {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        })
    });

    // Create and then retrieve an Asset Report for one or more Items. Note that an
    // Asset Report can contain up to 100 items, but for simplicity we're only
    // including one Item here.
    // https://plaid.com/docs/#assets
    app.get('/api/assets', function (request, response, next) {
      // You can specify up to two years of transaction history for an Asset
      // Report.
      let daysRequested = 10;

      // The `options` object allows you to specify a webhook for Asset Report
      // generation, as well as information that you want included in the Asset
      // Report. All fields are optional.
      let options = {
        client_report_id: 'Custom Report ID #123',
        // webhook: 'https://your-domain.tld/plaid-webhook',
        user: {
          client_user_id: 'Custom User ID #456',
          first_name: 'Alice',
          middle_name: 'Bobcat',
          last_name: 'Cranberry',
          ssn: '123-45-6789',
          phone_number: '555-123-4567',
          email: 'alice@example.com',
        },
      };
      client.createAssetReport(
        [ACCESS_TOKEN],
        daysRequested,
        options,
        function (error, assetReportCreateResponse) {
          if (error != null) {
            prettyPrintResponse(error);
            return response.json({
              error: error,
            });
          }
          prettyPrintResponse(assetReportCreateResponse);

          let assetReportToken = assetReportCreateResponse.asset_report_token;
          respondWithAssetReport(20, assetReportToken, client, response);
        });
    });

    // This functionality is only relevant for the UK Payment Initiation product.
    // Retrieve Payment for a specified Payment ID
    app.get('/api/payment', function (request, response, next) {
      client.getPayment(PAYMENT_ID, function (error, paymentGetResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error,
          });
        }
        prettyPrintResponse(paymentGetResponse);
        response.json({ error: null, payment: paymentGetResponse });
      });
    });

    // Retrieve information about an Item
    // https://plaid.com/docs/#retrieve-item
    app.get('/api/item', function (request, response, next) {
      // Pull the Item - this includes information about available products,
      // billed products, webhook information, and more.
      client.getItem(ACCESS_TOKEN, function (error, itemResponse) {
        if (error != null) {
          prettyPrintResponse(error);
          return response.json({
            error: error
          });
        }
        // Also pull information about the institution
        client.getInstitutionById(itemResponse.item.institution_id, function (err, instRes) {
          if (err != null) {
            let msg = 'Unable to pull institution information from the Plaid API.';
            console.log(msg + '\n' + JSON.stringify(error));
            return response.json({
              error: msg
            });
          } else {
            prettyPrintResponse(itemResponse);
            response.json({
              item: itemResponse.item,
              institution: instRes.institution,
            });
          }
        });
      });
    });

    const prettyPrintResponse = (response: any) => {
      console.log(util.inspect(response, { colors: true, depth: 4 }));
    };

    // This is a helper function to poll for the completion of an Asset Report and
    // then send it in the response to the client. Alternatively, you can provide a
    // webhook in the `options` object in your `/asset_report/create` request to be
    // notified when the Asset Report is finished being generated.
    let respondWithAssetReport = (
      numRetriesRemaining: number,
      assetReportToken: string,
      client: plaid.Client,
      response: any
    ) => {
      if (numRetriesRemaining == 0) {
        return response.json({
          error: 'Timed out when polling for Asset Report',
        });
      }

      let includeInsights = false;
      client.getAssetReport(
        assetReportToken,
        includeInsights,
        function (error: any, assetReportGetResponse) {
          if (error != null) {
            prettyPrintResponse(error);
            if (error.error_code == 'PRODUCT_NOT_READY') {
              setTimeout(
                () => respondWithAssetReport(
                  --numRetriesRemaining, assetReportToken, client, response),
                1000
              );
              return
            }

            return response.json({
              error: error,
            });
          }

          client.getAssetReportPdf(
            assetReportToken,
            function (error, assetReportGetPdfResponse) {
              if (error != null) {
                return response.json({
                  error: error,
                });
              }

              response.json({
                error: null,
                json: assetReportGetResponse.report,
                pdf: assetReportGetPdfResponse.buffer.toString('base64'),
              })
            }
          );
        }
      );
    };
  }
  static userIdToClientId(userid: string): string {
   return userid.replace("@", "_at_").replace(".", "_dot_");
  }
}