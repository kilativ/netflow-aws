export class Formatter {
    public static currencyUSD(value: number) {
        const formatter = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
        return formatter.format(value);
    }

    public static toISODateString(date: Date) {
        return date.toISOString().substring(0,10);
    }

}