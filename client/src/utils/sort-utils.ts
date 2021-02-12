import { NetflowTransaction } from "../../../shared/models/netflow-transaction";
import {Account} from 'plaid';

export class SortUtils {
    public sortTransactions(collection: NetflowTransaction[], sortColumn: string, asc: boolean) {
        switch (sortColumn) {
          case 'name':
            asc?
            collection.sort((a,b)=> (a?.name??"").localeCompare(b?.name??"")):
            collection.sort((b,a)=> (a?.name??"").localeCompare(b?.name??""));
            break;
          case 'amount':
            asc?
            collection.sort((a,b)=> (a.amount??0) - (b.amount??0)):
            collection.sort((b,a)=> (a.amount??0) - (b.amount??0));
            break;
          case 'date':
            asc?
            collection.sort((a,b)=> a.date.localeCompare(b.date)):
            collection.sort((b,a)=> a.date.localeCompare(b.date));
            break;
          case 'account':
            asc?
            collection.sort((a,b)=> (a?.account_name??"").localeCompare(b?.account_name??"")):
            collection.sort((b,a)=> (a?.account_name??"").localeCompare(b?.account_name??""));
            break;
          case 'category':
            asc?
            collection.sort((a,b)=> (a.category??[]).join().localeCompare((b.category??[]).join())):
            collection.sort((b,a)=> (a.category??[]).join().localeCompare((b.category??[]).join()));
            break;
        }
      }
    public sortAccounts(collection: Account[], sortColumn: string, asc: boolean) {
        switch (sortColumn) {
          case 'name':
            asc?
            collection.sort((a,b)=> (a?.name??"").localeCompare(b?.name??"")):
            collection.sort((b,a)=> (a?.name??"").localeCompare(b?.name??""));
            break;
          case 'number':
            asc?
            collection.sort((a,b)=> (a?.mask??"").localeCompare(b?.mask??"")):
            collection.sort((b,a)=> (a?.mask??"").localeCompare(b?.mask??""));
            break;
          case 'type':
            asc?
            collection.sort((a,b)=> `${a.type}-${a.subtype}`.localeCompare(`${b.type}-${b.subtype}`)):
            collection.sort((b,a)=> `${a.type}-${a.subtype}`.localeCompare(`${b.type}-${b.subtype}`));
            break;
          case 'balance':
            asc?
            collection.sort((a,b)=> a.balances.current - b.balances.current):
            collection.sort((b,a)=> a.balances.current - b.balances.current);
            break;
        }
      }
}