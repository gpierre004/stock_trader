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
      const groupedStocks = response.data as Record<string, any[]>;
      
      // Get the latest stock price for each ticker
      return Object.entries(groupedStocks).map(([ticker, prices]) => {
        if (prices.length > 0) {
          const latestPrice = prices[prices.length - 1];
          const previousPrice = prices.length > 1 ? prices[prices.length - 2] : latestPrice;
          
          // Calculate change and change percent
          const change = latestPrice.close - previousPrice.close;
          const changePercent = (change / previousPrice.close) * 100;

          return {
            id: latestPrice.id || 0,
            symbol: ticker,
            name: ticker, // Will be updated with company name later
            currentPrice: latestPrice.close,
            previousClose: previousPrice.close,
            change: change,
            changePercent: changePercent,
            volume: latestPrice.volume || 0,
            marketCap: 0, // This would need to be calculated if needed
            lastUpdated: new Date(latestPrice.date)
          };
        }
        return null;
      }).filter((stock): stock is Stock => stock !== null);
      
    } catch (error: any) {
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
      // Transform the watchlist data to match Stock interface
      return response.data.map((item: any) => ({
        id: item.id || 0,
        symbol: item.ticker || item.symbol,
        name: item.name || item.symbol,
        currentPrice: item.close || item.currentPrice || 0,
        previousClose: item.previousClose || item.close || 0,
        change: item.change || 0,
        changePercent: item.changePercent || 0,
        volume: item.volume || 0,
        marketCap: item.marketCap || 0,
        lastUpdated: new Date(item.date || item.lastUpdated)
      }));
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to fetch watchlist. Please try again later.');
    }
  }
}
