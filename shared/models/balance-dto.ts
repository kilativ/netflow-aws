export class BalanceDto {
    available: number | null;
    current: number;
    limit: number | null;
    iso_currency_code: string | null;
    unofficial_currency_code: string | null;
    account_id: string;
    date: string;
}

