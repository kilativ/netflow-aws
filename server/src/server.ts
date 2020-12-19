import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import { AuthRoutes } from './server-auth'
import { PlaidRoutes } from './server-plaid';
import { AccountDal } from './dal/account';
import  {GoogleAuth, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';


dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.static(path.resolve(__dirname)));
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(session({ secret: '4101b528-66a7-4e9a-8241-48a7c9ff5bd7' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json())

AuthRoutes.Add(app);
PlaidRoutes.Add(app);

app.get('/', (req, res) => {
  res.sendFile('./index.html', { root: __dirname });
})

const validateUser = function (req: any, res: any, next: any) {
  console.log('headers:', req.headers);
  console.log('headers:', req.headers["authorization"]);


  let token = req.headers["authorization"] as string;
  token = token.substr(7);
  
  var OAuth2 = google.auth.OAuth2;
  var oauth2Client = new OAuth2();
  oauth2Client.setCredentials({access_token: token});
var oauth2 = google.oauth2({
  auth: oauth2Client,
  version: 'v2'
});
oauth2.userinfo.get(
  function(err, res) {
    if (err) {
       console.log(err);
    } else {
       console.log(res);
    }
});



  
  next()
};

app.get('/user'
  , validateUser,
  function (req, res) {
    new AccountDal()
      .get('kilativ@gmail.com' as string)
      .then(data => res.send(data))
      .catch(err => res.status(500).json(err));
  });
