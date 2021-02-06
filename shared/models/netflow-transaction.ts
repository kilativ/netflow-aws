import { Transaction } from "plaid";

export interface NetflowTransaction extends Transaction {
    account_name: string;
    userId: string;
    search_string: string;
}