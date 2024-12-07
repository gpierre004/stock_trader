import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './presentation/pages/Dashboard/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Dashboard />
      </div>
    </Router>
  );
}

export default App;
