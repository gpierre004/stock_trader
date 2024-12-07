import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stock } from '../../core/domain/entities/Stock';
import { GetStockPricesUseCase } from '../../core/useCases/stock/GetStockPricesUseCase';
import { AddToWatchlistUseCase } from '../../core/useCases/stock/AddToWatchlistUseCase';
import { StockRepository } from '../../infrastructure/repositories/StockRepository';

interface StockContextType {
  stocks: Stock[];
  watchlist: Stock[];
  isLoading: boolean;
  error: string | null;
  addToWatchlist: (stockId: number) => Promise<void>;
  removeFromWatchlist: (stockId: number) => Promise<void>;
  refreshPrices: () => Promise<void>;
}

export const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stockRepository = new StockRepository();
  const getStockPricesUseCase = new GetStockPricesUseCase();
  const addToWatchlistUseCase = new AddToWatchlistUseCase();

  const refreshPrices = async () => {
    try {
      setIsLoading(true);
      const updatedStocks = await getStockPricesUseCase.execute();
      setStocks(updatedStocks);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stock prices');
      console.error('Error refreshing prices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = async (stockId: number) => {
    try {
      await stockRepository.addToWatchlist(stockId);
      const stockToAdd = stocks.find(s => s.id === stockId);
      if (stockToAdd) {
        setWatchlist([...watchlist, stockToAdd]);
      }
    } catch (err) {
      setError('Failed to add stock to watchlist');
      console.error('Error adding to watchlist:', err);
    }
  };

  const removeFromWatchlist = async (stockId: number) => {
    try {
      await stockRepository.removeFromWatchlist(stockId);
      setWatchlist(watchlist.filter(s => s.id !== stockId));
    } catch (err) {
      setError('Failed to remove stock from watchlist');
      console.error('Error removing from watchlist:', err);
    }
  };

  const loadWatchlist = async () => {
    try {
      const watchlistStocks = await stockRepository.getWatchlist();
      setWatchlist(watchlistStocks);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Failed to load watchlist');
    }
  };

  useEffect(() => {
    refreshPrices();
    loadWatchlist();
    // Set up periodic refresh (e.g., every 5 minutes)
    const interval = setInterval(refreshPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    stocks,
    watchlist,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    refreshPrices,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStocks = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStocks must be used within a StockProvider');
  }
  return context;
};
