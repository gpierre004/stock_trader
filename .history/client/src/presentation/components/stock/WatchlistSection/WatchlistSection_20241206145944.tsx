import React from 'react';
import { Stock } from '../../../../core/domain/entities/Stock';

interface WatchlistSectionProps {
  watchlist: Stock[];
  onRemoveFromWatchlist: (stockId: number) => Promise<void>;
}

const WatchlistSection: React.FC<WatchlistSectionProps> = ({ watchlist, onRemoveFromWatchlist }) => {
  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatPercentage = (value: number | undefined) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatVolume = (volume: number | undefined) => {
    if (typeof volume !== 'number') return 'N/A';
    return volume.toLocaleString();
  };

  if (watchlist.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Your watchlist is empty. Add stocks from the market overview to track them here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {watchlist.map((stock) => (
        <div
          key={stock.id}
          className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
              <p className="text-sm text-gray-500">{stock.name}</p>
            </div>
            <button
              onClick={() => onRemoveFromWatchlist(stock.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-lg font-medium text-gray-900">
                {formatPrice(stock.currentPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Change</p>
              <p className={`text-lg font-medium ${
                (stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(stock.changePercent)}
              </p>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-500">Volume</p>
            <p className="text-base text-gray-900">{formatVolume(stock.volume)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WatchlistSection;
