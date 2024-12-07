import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Stock Portfolio Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Stock List</h2>
          <p className="text-gray-500">Loading stocks...</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
          <p className="text-gray-500">Loading watchlist...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
