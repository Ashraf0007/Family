// src/Home.js
import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './Home.css'; // Import the CSS file

const Home = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name); // Set the name from Firestore
          } else {
            setUserName(auth.currentUser.email); // Fallback to email if name isn't available
          }
        } catch (error) {
          console.error("Error fetching user's name:", error);
          setUserName(auth.currentUser.email);
        }
      }
    };

    fetchUserName();
  }, []);

  return (
    <div className="home-container">
      <h1>Welcome, {userName}!</h1>
      <p className="welcome-message">
        We're thrilled to have you here. This application is designed to help you manage and keep track of all your financial transactions in one place. You can easily add, view, and filter your transactions. Enjoy using the platform to make your financial tracking seamless and organized!
      </p>
      <p>
        Noting that the <b>Credit</b> means you need to pay, but <b>Debit</b> means you will collect.
      </p>
    </div>
  );
};

export default Home;
