// src/ResetPassword.js
import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './ResetPassword.css';  // Import the CSS file

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');  // Reset error
    setMessage('');  // Reset message
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox.');
      setTimeout(() => {
        navigate('/'); // Redirect to login page after success
      }, 3000);
    } catch (error) {
      setError('Error sending password reset email. Please check the email address.');
    }
  };

  return (
    <div className="reset-password-container">
      <form className="reset-password-form" onSubmit={handleResetPassword}>
        <h2>Reset Your Password</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Password Reset Email</button>
        <p>
          Remembered your password? <Link to="/">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
