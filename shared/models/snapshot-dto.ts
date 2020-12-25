import {Account} from 'plaid'

export class SnapshotDto {
    balances: SnapshotBalance[];    
    account: Account;
}

export class SnapshotBalance {
    date: Date;
    balance: number;
    transactionAmount: number;
    notes: string;
    future = false;

    static build(date: Date, balance: number, transactionAmount: number, notes: string, future:boolean) {
        const instance  = new SnapshotBalance();
        instance.date = date;
        instance.balance = balance;
        instance.transactionAmount= transactionAmount;
        instance.notes = notes;
        instance.future = future;
        return instance;
    }
}