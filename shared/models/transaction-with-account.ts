import { Transaction } from "plaid";

export interface TransactionWithAccount extends Transaction {
    account_name: string;
}