import { AccountDal } from '../dal/account-dal';
import { OAuth2Client } from 'google-auth-library';

export class RouteValidation{
     static validateAccount = function (req: any, res: any, next: any) {
      const accountId = req.params.accountId;
      const response = res;
    
      RouteValidation.getUser(req).then(async (email: string) => {
        const user = await new AccountDal().get(email);
        const bank = user.banks.find(bank=> bank.accounts.map(acct=>acct.account_id).indexOf(accountId)>=0);
        if (bank) {
          req.account = bank.accounts.find(acct=> acct.account_id === accountId);
          req.user = email;
          next();
        } else {
          response.status(401).json("not authorized")
        }
      }).catch((error: any) => {
        console.log(error);
        response.status(401).json("not authorized");
      });
    } 
    
   static validateUser = function (req: any, res: any, next: any) {
    RouteValidation.getUser(req).then((email: any) =>{
        req.user = email;
        next()
      } ).catch(()=>res.status(401).json("not authorized"))
    };
    
    static getUser = async function (req: { headers: { [x: string]: string; }; }) : Promise<string> {
      let token = req.headers["authorization"] as string;
      token = token.substr(7); // bearer 
    
      const newClient = new OAuth2Client();
      const tokenInfo = await newClient.getTokenInfo(token);
      return tokenInfo.email;
    }
}