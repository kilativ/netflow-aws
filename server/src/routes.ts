import express from 'express';
import expressAsyncHandler from 'express-async-handler'
import { AccountDal } from './dal/account-dal';
import { TransactionDal } from './dal/transactions-dal';
import { SnapshotCalculator } from './snapshot-calculator';
import  {OAuth2Client} from 'google-auth-library';
import { NetFlowUser } from '../../shared/models/account-dto';
import { PlaidDal } from './plaid-dal';

export class Routes {

  public static Add(app: express.Express) {
    app.get('/', (req, res) => {
      res.sendFile('./index.html', { root: __dirname });
    })
    
    app.get('/status', (req, res) => {
      res.send('ok');
    })
    
    app.get('/test-env', (req, res) => {
      res.send(process.env["TEST_PARAM"]);
    })
    
    const validateAccount = function (req: any, res: any, next: any) {
      const accountId = req.params.accountId;
      const response = res;
    
      getUser(req).then(async email => {
        const user = await new AccountDal().get(email);
        const bank = user.banks.find(bank=> bank.accounts.map(acct=>acct.account_id).indexOf(accountId)>=0);
        if (bank) {
          req.account = bank.accounts.find(acct=> acct.account_id === accountId);
          next();
        } else {
          response.status(401).json("not authorized")
        }
      }).catch(error => {
        console.log(error);
        response.status(401).json("not authorized");
      });
    } 
    
    const validateUser = function (req: any, res: any, next: any) {
      getUser(req).then(email =>{
        req.user = email;
        next()
      } ).catch(()=>res.status(401).json("not authorized"))
    };
    
    const getUser = async function (req: { headers: { [x: string]: string; }; }) : Promise<string> {
      let token = req.headers["authorization"] as string;
      token = token.substr(7); // bearer 
    
      const newClient = new OAuth2Client();
      const tokenInfo = await newClient.getTokenInfo(token);
      return tokenInfo.email;
    }
    
    app.get('/s/api/user'
      , validateUser,
      expressAsyncHandler(async (req: any, res) => {
        let dal = new AccountDal();
        let data = await dal.get(req.user as string)
        res.send(data);
      })
    );
    
    app.post('/s/api/user/account', validateUser, expressAsyncHandler(async(request:any, res)=> {
      const plaidDal = new PlaidDal();
      const tokenResponse = await plaidDal.exchangePublicToken(request.body.public_token);
      const bankInfo = await plaidDal.getBankInfo(tokenResponse.access_token);
    
      await new AccountDal().addBankToUser(request.user as string, tokenResponse.access_token, bankInfo);
    
      console.log(tokenResponse);
      res.send('ok');
    }))
    
    app.post('/s/api/user'
      , validateUser,
      expressAsyncHandler(async (req: any, res) => {
        let dal = new AccountDal();
        let userid = req.user as string;
        let user = await dal.get(userid);
        if (!user) {
          user = new NetFlowUser();
          user.userId = userid;
          user = await dal.addUser(user)
          res.send(user);
        } else {
          throw Error(`user ${userid} already exists`)
        }
      })
    );
    
    app.get('/s/api/account/:accountId/transactions'
      , validateAccount,
      expressAsyncHandler(async (req: any, res) => {
        let dal = new TransactionDal();
        let txn = await dal.getAllForAccount(req.params.accountId) // todo paging
        res.send(txn)
      })
    );
    
    app.get('/s/api/snapshot/:accountId'
      , [validateUser, validateAccount], 
      expressAsyncHandler(async (req: any, res: any) => {
        let calc = new SnapshotCalculator()
        let snap = await calc.get(req.account, 60, 30, req.user);
        res.send(snap)
      })
    );
  }
}


// export = app;
