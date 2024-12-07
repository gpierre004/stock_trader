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
      
      // Flatten the array of arrays and get the latest price for each stock
      return stocksArrays.flat().reduce((acc: Stock[], stockArray: Stock[]) => {
        if (stockArray.length > 0) {
          // Get the most recent stock data
          acc.push(stockArray[stockArray.length - 1]);
        }
        return acc;
      }, []);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      throw error;
    }
  }
}
