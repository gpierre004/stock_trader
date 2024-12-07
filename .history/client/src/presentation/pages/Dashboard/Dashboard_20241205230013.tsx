import React from 'react';
import StockList from '../../components/stock/StockList/StockList';
import WatchlistSection from '../../components/stock/WatchlistSection/WatchlistSection';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock Portfolio Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StockList />
        <WatchlistSection />
      </div>
    </div>
  );
};

export default Dashboard;
