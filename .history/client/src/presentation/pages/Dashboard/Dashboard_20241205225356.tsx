import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStocks } from '../../hooks/useStocks';
import { useAuth } from '../../hooks/useAuth';
import StockList from '../../components/stock/StockList/StockList';
import WatchlistSection from '../../components/stock/WatchlistSection/WatchlistSection';
import Button from '../../components/common/button/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stocks, watchlist, isLoading, error, addToWatchlist, removeFromWatchlist } = useStocks();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Stock Trader</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.name}</span>
              <Button
                variant="danger"
                size="small"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Market Overview</h2>
              <StockList
                stocks={stocks}
                onAddToWatchlist={addToWatchlist}
                watchlistIds={watchlist.map(stock => stock.id)}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Your Watchlist</h2>
              <WatchlistSection
                watchlist={watchlist}
                onRemoveFromWatchlist={removeFromWatchlist}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
