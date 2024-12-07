import { IStockRepository } from '../../core/domain/interfaces/repositories/IStockRepository';
import { Stock } from '../../core/domain/entities/Stock';
import { api } from '../api/axios.config';

export class StockRepository implements IStockRepository {
  async getStockPrices(ticker: string, startDate: Date, endDate: Date): Promise<Stock[]> {
    const response = await api.get('/stock-prices', {
      params: {
        ticker,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data.stocks;
  }

  async getCompanies(): Promise<string[]> {
    const response = await api.get('/companies');
    return response.data.companies;
  }

  async addToWatchlist(stockId: number): Promise<void> {
    await api.post('/watchlist', { stockId });
  }

  async removeFromWatchlist(stockId: number): Promise<void> {
    await api.delete(`/watchlist/${stockId}`);
  }

  async getWatchlist(): Promise<Stock[]> {
    const response = await api.get('/watchlist');
    return response.data.stocks;
  }
}
