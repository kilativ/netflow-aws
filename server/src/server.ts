import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import passport from 'passport';
import ensureLoggedIn from 'connect-ensure-login';
import session from 'express-session';
import { AuthRoutes } from './server-auth'
import { PlaidRoutes } from './server-plaid';
import { AccountDal } from './dal/account';
import { NetFlowUser } from '../../shared/models/account-dto';

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

app.get('/user', ensureLoggedIn.ensureLoggedIn('/auth/google'),
  function (req, res) {
    new AccountDal()
    .get((req.user as NetFlowUser).userId)
    .then(data=>res.send(data))
    .catch(err=>console.log(err));
});
