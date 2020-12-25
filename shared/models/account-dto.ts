import {Account} from 'plaid';

export class NetFlowUser {
    userId!: string;
    googleUser!: GoogleUser;
    banks!: NetFlowPlaidBankLink[];
    settings: NetFlowUserSettings;
}

export class NetFlowUserSettings{
    accountSnapshots: AccountSnapshotSettings[];
}

export class AccountSnapshotSettings {
    account_id: string;
    scheduledTransactions:  AccountSnapshotScheduledTransactionsSettings[];
}

export class AccountSnapshotScheduledTransactionsSettings {
    date: number;
    description: string;
    amount: number;
    type: string;
    linked_account_id: string; // if type is transfer
    gracePeriod: number; // if type is transfer
}

export class GoogleUser {
    id!: string;
    displayName!: string;
    emails: GoogleEmail[] = [];
}

export class NetFlowPlaidBankLink {
    id!: string;
    nickname!: string;
    token!: string;
    active!: boolean;
    accounts: Account[];
}

export interface GoogleEmail {
    verified: boolean;
    value: string;
}

export interface GoogleName {
    familyName: string;
    givenName: string;
}

export interface Value {
    value: string;
}

