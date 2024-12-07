import { Stock } from '../../entities/Stock';

export interface Company {
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  active?: boolean;
}

export interface IStockRepository {
  getStockPrices(ticker: string, startDate: Date, endDate: Date): Promise<Stock[]>;
  getCompanies(): Promise<Company[]>;
  addToWatchlist(stockId: number): Promise<void>;
  removeFromWatchlist(stockId: number): Promise<void>;
  getWatchlist(): Promise<Stock[]>;
}
