import { StockRepository } from '../../../infrastructure/repositories/StockRepository';

export class AddToWatchlistUseCase {
  private stockRepository: StockRepository;

  constructor() {
    this.stockRepository = new StockRepository();
  }

  async execute(stockId: number): Promise<void> {
    try {
      await this.stockRepository.addToWatchlist(stockId);
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
      throw error;
    }
  }
}
