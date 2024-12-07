import { Stock } from '../../domain/entities/Stock';
import { StockRepository } from '../../../infrastructure/repositories/StockRepository';

interface Company {
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  active?: boolean;
}

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
      const companies = await this.stockRepository.getCompanies() as Company[];
      
      // Get prices for all companies
      const stockPromises = companies.map(company => 
        this.stockRepository.getStockPrices(company.ticker, startDate, endDate)
      );

      const stocksArrays = await Promise.all(stockPromises);
      
      // Get the latest price for each stock
      return stocksArrays.map((stockArray, index) => {
        if (stockArray.length > 0) {
          const stock = stockArray[stockArray.length - 1];
          // Ensure the stock has the company name
          return {
            ...stock,
            name: companies[index].name
          };
        }
        return null;
      }).filter((stock): stock is Stock => stock !== null);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      throw error;
    }
  }
}
