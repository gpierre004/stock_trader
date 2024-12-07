import React from 'react';
import { useStocks } from '../../context/StockContext';
import StockList from '../../components/stock/StockList/StockList';
import WatchlistSection from '../../components/stock/WatchlistSection/WatchlistSection';
import { Stock } from '../../../core/domain/entities/Stock';

const Dashboard: React.FC = () => {
  const { 
    stocks, 
    watchlist, 
    isLoading, 
    error, 
    addToWatchlist,
    removeFromWatchlist 
  } = useStocks();

  const watchlistIds = watchlist.map((stock: Stock) => stock.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Stock Portfolio Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Stock List</h2>
          {isLoading ? (
            <p className="text-gray-600">Loading stocks...</p>
          ) : stocks.length === 0 ? (
            <p className="text-gray-600">No stocks available</p>
          ) : (
            <StockList 
              stocks={stocks}
              watchlistIds={watchlistIds}
              onAddToWatchlist={addToWatchlist}
            />
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
          {isLoading ? (
            <p className="text-gray-600">Loading watchlist...</p>
          ) : watchlist.length === 0 ? (
            <p className="text-gray-600">No stocks in watchlist</p>
          ) : (
            <WatchlistSection 
              watchlist={watchlist}
              onRemoveFromWatchlist={removeFromWatchlist}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
