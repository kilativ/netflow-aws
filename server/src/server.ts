import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import session from 'express-session';
import { PlaidRoutes } from './server-plaid';
import { AccountDal } from './dal/account-dal';
import { google } from 'googleapis';
import { TransactionDal } from './dal/transactions-dal';
import { SnapshotBalance } from '../../shared/models/snapshot-dto';

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
  console.log(req.params.accountId);
  const accountId = req.params.accountId;
  const response = res;

  getUser(req).then(async email => {
    const user = await new AccountDal().get(email);
    const bank = user.banks.find(bank=> bank.accounts.map(acct=>acct.account_id).indexOf(accountId)>=0);
    if (bank) {
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
    req.user = email
    next()
  } ).catch(()=>res.status(401).json("not authorized"))
};

const getUser = function (req: { headers: { [x: string]: string; }; }) : Promise<string> {
  let token = req.headers["authorization"] as string;
  token = token.substr(7); // bearer 

  var OAuth2 = google.auth.OAuth2;
  var oauth2Client = new OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  var oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });

  return new Promise((resolve, reject) => {
    oauth2.userinfo.get(
      function (err, googlResponse) {
        if (err) {
          reject(err);
        } else {
          resolve(googlResponse.data.email)
        }
      });
  });

}

app.get('/s/api/user'
  , validateUser,
  function (req: any, res) {
    console.log(req);
    new AccountDal()
      .get(req.user as string)
      .then(data => res.send(data))
      .catch(err => res.status(500).json(err));
  });

app.get('/s/api/transactions/:accountId'
  , validateAccount,
  function (req: any, res) {
    new TransactionDal().getAllForAccount(req.params.accountId)
    .then(txn=> res.send(txn))
    .catch(err => res.status(500).json(err));
  });


app.get('/s/api/snapshot/:accountId', /*validateAccount,*/ function(req, res) {
  const results = [
    SnapshotBalance.build(new Date('2020-12-20'), 2000, 2000, 'current', false),
    SnapshotBalance.build(new Date('2020-12-21'), 1900, -100, 'Chase Freedom Car Payment', true),
    SnapshotBalance.build(new Date('2020-12-22'), 1850, -50, 'Bank of America Visa Payment', true),
    SnapshotBalance.build(new Date('2020-12-23'), 3000, 1150, 'Microsoft Paycheck', true),
    SnapshotBalance.build(new Date('2020-12-24'), 1500, -1500, 'Wells Fargo Mortgage', true),
    SnapshotBalance.build(new Date('2020-12-25'), 1200, -300, 'Wells Fargo MasterCard', true),
  ]
  res.send(results);
});

