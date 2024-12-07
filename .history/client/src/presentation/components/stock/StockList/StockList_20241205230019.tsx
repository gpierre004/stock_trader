import React from 'react';

const StockList: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Stock List</h2>
      <p className="text-gray-500">Loading stocks...</p>
    </div>
  );
};

export default StockList;
