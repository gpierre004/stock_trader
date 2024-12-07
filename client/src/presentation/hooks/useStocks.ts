import { useContext } from 'react';
import { StockContext } from '../context/StockContext';

export const useStocks = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStocks must be used within a StockProvider');
  }
  return context;
};
