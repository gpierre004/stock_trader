import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Stock } from '../../core/domain/entities/Stock';
import { GetStockPricesUseCase } from '../../core/useCases/stock/GetStockPricesUseCase';
import { AddToWatchlistUseCase } from '../../core/useCases/stock/AddToWatchlistUseCase';
import { StockRepository } from '../../infrastructure/repositories/StockRepository';
import { clearStockPriceQueue } from '../../infrastructure/api/axios.config';

interface StockContextType {
  stocks: Stock[];
  watchlist: Stock[];
  isLoading: boolean;
  error: string | null;
  addToWatchlist: (stockId: number) => Promise<void>;
  removeFromWatchlist: (stockId: number) => Promise<void>;
  refreshPrices: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

function StockProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const stockRepository = new StockRepository();
  const getStockPricesUseCase = new GetStockPricesUseCase();
  const addToWatchlistUseCase = new AddToWatchlistUseCase();

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const refreshPrices = useCallback(async (force: boolean = false) => {
    try {
      // Prevent refresh if less than 1 minute has passed since last refresh
      // unless force=true is specified
      if (!force && lastRefreshTime) {
        const timeSinceLastRefresh = new Date().getTime() - lastRefreshTime.getTime();
        if (timeSinceLastRefresh < 60000) { // 1 minute in milliseconds
          return;
        }
      }

      setIsLoading(true);
      const updatedStocks = await getStockPricesUseCase.execute();
      setStocks(updatedStocks);
      setLastRefreshTime(new Date());
      setError(null);
    } catch (err: any) {
      // Handle rate limit errors specially
      if (err.message.includes('Rate limit exceeded')) {
        setError(err.message);
        // Don't set isLoading to false for rate limit errors
        // as the request is queued and will be processed
        return;
      }
      setError(err.message || 'Failed to fetch stock prices');
      console.error('Error refreshing prices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [lastRefreshTime]);

  const addToWatchlist = async (stockId: number) => {
    try {
      await stockRepository.addToWatchlist(stockId);
      const stockToAdd = stocks.find(s => s.id === stockId);
      if (stockToAdd) {
        setWatchlist([...watchlist, stockToAdd]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add stock to watchlist');
      console.error('Error adding to watchlist:', err);
    }
  };

  const removeFromWatchlist = async (stockId: number) => {
    try {
      await stockRepository.removeFromWatchlist(stockId);
      setWatchlist(watchlist.filter(s => s.id !== stockId));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove stock from watchlist');
      console.error('Error removing from watchlist:', err);
    }
  };

  const loadWatchlist = async () => {
    try {
      const watchlistStocks = await stockRepository.getWatchlist();
      setWatchlist(watchlistStocks);
      setError(null);
    } catch (err: any) {
      console.error('Error loading watchlist:', err);
      setError(err.message || 'Failed to load watchlist');
    }
  };

  useEffect(() => {
    // Initial load
    refreshPrices(true);
    loadWatchlist();

    // Set up periodic refresh every 5 minutes
    const interval = setInterval(() => refreshPrices(false), 5 * 60 * 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      clearStockPriceQueue(); // Clear any pending requests
    };
  }, []);

  const value = {
    stocks,
    watchlist,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    refreshPrices: () => refreshPrices(true), // Allow force refresh when manually triggered
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

function useStocks() {
  const context = React.useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStocks must be used within a StockProvider');
  }
  return context;
}

export { StockProvider, useStocks };
