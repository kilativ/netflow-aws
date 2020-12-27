import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import session from 'express-session';
import { PlaidRoutes } from './server-plaid';
import { AccountDal } from './dal/account-dal';
import { TransactionDal } from './dal/transactions-dal';
import { SnapshotCalculator } from './snapshot-calculator';
import  {OAuth2Client} from 'google-auth-library';

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.static(path.resolve(__dirname)));
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(session({ secret: '4101b528-66a7-4e9a-8241-48a7c9ff5bd7' }));
app.use(bodyParser.json())

PlaidRoutes.Add(app);

app.get('/', (req, res) => {
  res.sendFile('./index.html', { root: __dirname });
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
  function (req: any, res) {
    new AccountDal()
      .get(req.user as string)
      .then(data => res.send(data))
      .catch(err => res.status(500).json(err));
  });

app.get('/s/api/transactions/:accountId'
  , validateAccount,
  function (req: any, res) {
    new TransactionDal().getAllForAccount(req.params.accountId, /* 0,*/ 50) // todo paging
    .then(txn=> res.send(txn))
    .catch(err => res.status(500).json(err));
  });


app.get('/s/api/snapshot/:accountId', [validateUser, validateAccount], async function(req: any, res: any) {
  try {
    res.send(await new SnapshotCalculator().get(req.account, 45, 45, req.user));
  } catch (e) { // not sure why global is not working yet.
    res.status(500).send(e.message);
  }
});

app.use((err:any, req:any, res:any, next:any) => {
  res.status(err.status || 500);
  res.end();
});

