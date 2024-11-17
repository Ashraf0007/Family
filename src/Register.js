// src/Register.js
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ setShowHeader }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setShowHeader(false); // Hide the header on the register page
    return () => setShowHeader(true); // Show the header when leaving this page
  }, [setShowHeader]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: user.email,
        uid: user.uid,
        fcmToken: '',
      });

      setSuccess('Registration successful! Redirecting to the Home page...');

      // Redirect to the dashboard after showing success message
      setTimeout(() => {
        setSuccess('');
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error registering user:', error);
      setError(error.message);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        {success && <div className="toast success">{success}</div>}
        {error && <p className="error-message">{error}</p>}
        <p>
          Already have an account? <Link to="/">Login now</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
