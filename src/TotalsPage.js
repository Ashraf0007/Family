import React, { useEffect, useState } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './TotalsPage.css';

const TotalsPage = () => {
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [totals, setTotals] = useState(0);
  const [userId, setUserId] = useState(null);

  // Get the logged-in user's ID
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch all users (for name lookup)
  const fetchUsers = async () => {
    try {
      const userCollection = collection(db, 'users');
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      return userList;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  // Fetch names from all transactions where the logged-in user is involved
  useEffect(() => {
    if (!userId) return;

    const fetchNames = async () => {
      const nameSet = new Set();

      try {
        // Fetch all transactions where the logged-in user is involved
        const transactionsSnapshot = await getDocs(collection(db, 'transactions'));

        // Fetch all users to get the name based on UID
        const users = await fetchUsers();

        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();

          // Check if the logged-in user is the creator or recipient, and get their name
          if ((data.userId === userId && data.relatedUserId) || (data.relatedUserId === userId && data.userId)) {
            // Get the related user's name
            const relatedUser = users.find(user => user.uid === (data.userId === userId ? data.relatedUserId : data.userId));
            if (relatedUser) {
              nameSet.add(relatedUser.name);  // Add related user's name to the set
            }
          }
        });

        // Update the names list with unique names involved in transactions with the logged-in user
        setNames(Array.from(nameSet));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchNames();
  }, [userId]);

  // Calculate totals for the selected name
  useEffect(() => {
    if (!userId || !selectedName) return;

    let total = 0;

    const calculateTotals = async () => {
      try {
        // Fetch all transactions to calculate totals
        const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
        const users = await fetchUsers(); // Get all users to resolve names from UID

        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();

          // Match if both the logged-in user and the selected user are involved in the transaction
          if ((data.userId === userId && data.relatedUserId) || (data.relatedUserId === userId && data.userId)) {
            // Check if the selected name is either the creator or recipient
            const involvedUser = users.find(user => user.uid === (data.userId === userId ? data.relatedUserId : data.userId));

            // If the involved user is the selected name, calculate the total
            if (involvedUser && involvedUser.name === selectedName) {
              // Creator (userId): Add for credit, subtract for debit
              if (data.userId === userId) {
                const amount = parseFloat(data.amount);
                total += data.type === 'credit' ? amount : -amount;
              }
              // Recipient (relatedUserId): Add for debit, subtract for credit
              if (data.relatedUserId === userId) {
                const amount = parseFloat(data.amount);
                total += data.type === 'debit' ? amount : -amount;
              }
            }
          }
        });

        // Set the total amount in state
        setTotals(total);
      } catch (error) {
        console.error('Error calculating totals:', error);
      }
    };

    calculateTotals();
  }, [userId, selectedName]);

  return (
    <div className="totals-page-container">
      <h2>Totals by Person</h2>
      <div className="totals-dropdown">
        <label>Select Person:</label>
        <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
          <option value="">-- Select a Person --</option>
          {names.length > 0 ? (
            names.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))
          ) : (
            <option>No available names</option>
          )}
        </select>
      </div>

      {selectedName && (
        <div className="totals-display">
          <h3>Total for {selectedName}:</h3>
          <p>{totals >= 0 ? 'Credit' : 'Debit'} ${Math.abs(totals).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default TotalsPage;
