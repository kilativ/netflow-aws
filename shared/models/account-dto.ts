export class NetFlowUser {

    
    userId: string;
    googleUser: GoogleUser;
    accounts: Account[];
}

export class GoogleUser {
    id: string;
    displayName: string;
    emails: GoogleEmail[];
}

export class Account {
    id: string;
    nickname: string;
    token: string;
    active: boolean;
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

export interface Google {
    emails: GoogleEmail[];
    provider: string;
    displayName: string;
    name: GoogleName;
    id: string;
    photos: Value[];
}

