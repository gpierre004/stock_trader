import { IStockRepository } from '../../core/domain/interfaces/repositories/IStockRepository';
import { Stock } from '../../core/domain/entities/Stock';
import { api } from '../api/axios.config';

export class StockRepository implements IStockRepository {
  async getStockPrices(ticker: string, startDate: Date, endDate: Date): Promise<Stock[]> {
    const response = await api.get('/api/stock-prices', {
      params: {
        ticker: ticker, // Send ticker as string
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data;
  }

  async getCompanies(): Promise<string[]> {
    const response = await api.get('/api/companies');
    return response.data;
  }

  async addToWatchlist(stockId: number): Promise<void> {
    await api.post('/api/watchlist', { stockId });
  }

  async removeFromWatchlist(stockId: number): Promise<void> {
    await api.delete(`/api/watchlist/${stockId}`);
  }

  async getWatchlist(): Promise<Stock[]> {
    const response = await api.get('/api/watchlist');
    return response.data;
  }
}