import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import session from 'express-session';
import { PlaidRoutes } from './server-plaid';
import { Routes } from './routes';
import cors from 'cors';


let error;
( { error } = dotenv.config());
if (error) {
  console.log(error)
}

const app = express();
app.use(cors());
// app.use(express.static(path.resolve(__dirname)));
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(session({ secret: '4101b528-66a7-4e9a-8241-48a7c9ff5bd7' }));
app.use(bodyParser.json())

Routes.Add(app);
PlaidRoutes.Add(app);

export = app;
