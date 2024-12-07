import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './presentation/pages/Dashboard/Dashboard';
import Login from './presentation/pages/Login/Login';
import { AuthProvider, useAuth } from './presentation/context/AuthContext';
import { StockProvider } from './presentation/context/StockContext';

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route 
                path="/" 
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                } 
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </Router>
      </StockProvider>
    </AuthProvider>
  );
}

// RequireAuth component to protect routes
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;
