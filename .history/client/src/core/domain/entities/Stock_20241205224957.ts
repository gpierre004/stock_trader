export interface Stock {
    id: number;
    symbol: string;
    name: string;
    currentPrice: number;
    previousClose: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    lastUpdated: Date;
}
