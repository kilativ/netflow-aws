export class Snapshot {
    balances: SnapshotBalance[];    
}

export class SnapshotBalance {
    date: Date;
    balance: number;
    notes: string;
    future = false;

    static build(date: Date, balance: number, notes: string, future:boolean) {
        const instance  = new SnapshotBalance();
        instance.date = date;
        instance.balance = balance;
        instance.notes = notes;
        instance.future = future;
        return instance;
    }
}