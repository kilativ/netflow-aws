import { NetflowTransaction } from "../../../shared/models/netflow-transaction";

export class SortUtils {
    public sortTransactions(collection: NetflowTransaction[], sortColumn: string, asc: boolean) {
        switch (sortColumn) {
          case 'name':
            asc?
            collection.sort((a,b)=> {return (a?.name??"").localeCompare(b?.name??"");}):
            collection.sort((b,a)=> {return (a?.name??"").localeCompare(b?.name??"");});
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
            collection.sort((a,b)=> {return (a?.account_name??"").localeCompare(b?.account_name??"");}):
            collection.sort((b,a)=> {return (a?.account_name??"").localeCompare(b?.account_name??"");});
            break;
          case 'category':
            asc?
            collection.sort((a,b)=> {return (a.category??[]).join().localeCompare((b.category??[]).join());}):
            collection.sort((b,a)=> {return (a.category??[]).join().localeCompare((b.category??[]).join());});
            break;
        }
      }
    }