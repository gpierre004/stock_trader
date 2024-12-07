import { IStockRepository, Company } from '../../core/domain/interfaces/repositories/IStockRepository';
import { Stock } from '../../core/domain/entities/Stock';
import { api } from '../api/axios.config';

export class StockRepository implements IStockRepository {
  async getStockPrices(tickers: string[], startDate: Date, endDate: Date): Promise<Stock[]> {
    try {
      const response = await api.get('/api/stock-prices', {
        params: {
          tickers: tickers,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      // Transform grouped response into flat array
      // response.data is Record<string, Stock[]>
      const groupedStocks = response.data as Record<string, Stock[]>;
      
      // Get the latest stock price for each ticker
      return Object.entries(groupedStocks).map(([ticker, prices]) => {
        if (prices.length > 0) {
          return prices[prices.length - 1]; // Return the most recent price
        }
        return null;
      }).filter((stock): stock is Stock => stock !== null);
      
    } catch (error: any) {
      // Handle rate limit and other errors
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded for stock price requests. Your request has been queued and will be processed shortly.');
      }
      throw new Error(error.userMessage || 'Failed to fetch stock prices. Please try again later.');
    }
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await api.get<Company[]>('/api/companies');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to fetch companies. Please try again later.');
    }
  }

  async addToWatchlist(stockId: number): Promise<void> {
    try {
      await api.post('/api/watchlist', { stockId });
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to add stock to watchlist. Please try again later.');
    }
  }

  async removeFromWatchlist(stockId: number): Promise<void> {
    try {
      await api.delete(`/api/watchlist/${stockId}`);
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to remove stock from watchlist. Please try again later.');
    }
  }

  async getWatchlist(): Promise<Stock[]> {
    try {
      const response = await api.get('/api/watchlist');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to fetch watchlist. Please try again later.');
    }
  }
}
