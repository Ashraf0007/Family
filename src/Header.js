// src/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import './Header.css';  // Import the CSS file

const Header = () => {
  const navigate = useNavigate();

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header>
      <div className="logo-container">
        {/* Add Logo */}
        <img src="/images/logo.png" alt="App Logo" className="app-logo" />
      </div>
      <div>
        {/* Navigation Tabs */}
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">Home</Link>
            </li>
            <li>
              <Link to="/dashboard/profile">Profile</Link> {/* Add Profile Tab */}
            </li>
            <li>
              <Link to="/dashboard/transaction-form">Transaction Form</Link>
            </li>
            <li>
              <Link to="/dashboard/transaction-list">Transaction List</Link>
            </li>
            <li>
              <Link to="/dashboard/totals">Totals</Link> {/* New Totals link */}
            </li>
          </ul>
        </nav>
      </div>
      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </header>
  );
};

export default Header;
