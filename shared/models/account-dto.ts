export class NetFlowUser {
    userId!: string;
    googleUser!: GoogleUser;
    accounts!: NetFlowPlaidBankAccount[];
}

export class GoogleUser {
    id!: string;
    displayName!: string;
    emails: GoogleEmail[] = [];
}

export class NetFlowPlaidBankAccount {
    id!: string;
    nickname!: string;
    token!: string;
    active: boolean = false;
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

