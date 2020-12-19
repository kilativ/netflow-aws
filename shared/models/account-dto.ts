import {Account} from 'plaid';

export class NetFlowUser {
    userId!: string;
    googleUser!: GoogleUser;
    banks!: NetFlowPlaidBankLink[];
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

