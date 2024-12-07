import { Stock } from '../../domain/entities/Stock';
import { StockRepository } from '../../../infrastructure/repositories/StockRepository';
import { Company } from '../../domain/interfaces/repositories/IStockRepository';

export class GetStockPricesUseCase {
  private stockRepository: StockRepository;

  constructor() {
    this.stockRepository = new StockRepository();
  }

  async execute(): Promise<Stock[]> {
    // Get today's date and 24 hours ago for the default time range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000));

    try {
      // Get list of companies first
      const companies = await this.stockRepository.getCompanies();
      
      // Extract all tickers
      const tickers = companies.map(company => company.ticker);
      
      // Get prices for all companies in a single request
      const stocks = await this.stockRepository.getStockPrices(tickers, startDate, endDate);
      
      // Add company names to stocks
      return stocks.map(stock => {
        const company = companies.find(c => c.ticker === stock.symbol);
        return {
          ...stock,
          name: company?.name || stock.symbol
        };
      });
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      throw error;
    }
  }
}
