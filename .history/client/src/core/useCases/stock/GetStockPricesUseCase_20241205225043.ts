import { Stock } from '../../domain/entities/Stock';
import { StockRepository } from '../../../infrastructure/repositories/StockRepository';

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
      
      // Get prices for all companies
      const stockPromises = companies.map(ticker => 
        this.stockRepository.getStockPrices(ticker, startDate, endDate)
      );

      const stocksArrays = await Promise.all(stockPromises);
      
      // Get the latest price for each stock
      return stocksArrays.map(stockArray => {
        if (stockArray.length > 0) {
          return stockArray[stockArray.length - 1];
        }
        return null;
      }).filter((stock): stock is Stock => stock !== null);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      throw error;
    }
  }
}
