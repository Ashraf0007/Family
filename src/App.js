// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import Register from './Register';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import ProtectedRoute from './ProtectedRoute';
import Home from './Home';
import Header from './Header';
import Profile from './Profile';
import TotalsPage from './TotalsPage';
import ResetPassword from './ResetPassword';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );
  const [showHeader, setShowHeader] = useState(true); // State to control header visibility

  // Check authentication status on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const authStatus = !!user;
      setIsAuthenticated(authStatus);
      localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  return (
    <Router basename="/Family/">
      <div
        className="App"
        >

        {/* Conditionally render Header based on authentication and showHeader state */}
        {isAuthenticated && showHeader && <Header />}

        <Routes>
          {/* Login Route */}
          <Route path="/" element={<Login onLogin={() => setIsAuthenticated(true)} />} />

          {/* Register Route (Pass setShowHeader to control header visibility) */}
          <Route path="/register" element={<Register setShowHeader={setShowHeader} />} />

          {/* Reset password Route */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Home Route for logged-in users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes for Transaction Form and Transaction List */}
          <Route
            path="/dashboard/transaction-form"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <TransactionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/transaction-list"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <TransactionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/totals"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <TotalsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
