import React, { useEffect, useState } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './TransactionList.css';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [names, setNames] = useState([]);
  const [createdByNames, setCreatedByNames] = useState([]); // State for Created by filter
  const [searchPerson, setSearchPerson] = useState('');
  const [searchDateFrom, setSearchDateFrom] = useState('');
  const [searchDateTo, setSearchDateTo] = useState('');
  const [searchCreatedBy, setSearchCreatedBy] = useState(''); // State for Created by filter
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]); // Store all users for name lookup

  // Get the logged-in user's ID
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setError('');
      } else {
        setUserId(null);
        setTransactions([]);
        setError('You must be logged in to see transactions.');
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
      setUsers(userList); // Store users in state
      return userList;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  // Fetch all transactions and names of users involved
  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      const nameSet = new Set();
      const createdBySet = new Set(); // Set to store created by names
      const transactionsList = [];

      try {
        // Fetch all users to lookup names
        const users = await fetchUsers();

        // Fetch all transactions
        const transactionsSnapshot = await getDocs(collection(db, 'transactions'));

        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Check if the logged-in user is involved
          if ((data.userId === userId && data.relatedUserId) || (data.relatedUserId === userId && data.userId)) {
            // Get the related user's name
            const relatedUser = users.find(user => user.uid === (data.userId === userId ? data.relatedUserId : data.userId));
            if (relatedUser) {
              nameSet.add(relatedUser.name);  // Add related user's name to the set
            }

            // Get the creator's name for the "Created by" column
            const creator = users.find(user => user.uid === data.userId);
            if (creator) {
              createdBySet.add(creator.name);  // Add creator's name to the set
            }

            // If the logged-in user is the relatedUserId, reverse the transaction type
            if (data.relatedUserId === userId) {
              data.type = data.type === 'credit' ? 'debit' : 'credit';  // Reverse the type
            }

            // Add the transaction to the list
            transactionsList.push({
              id: doc.id,
              ...data,
              person: relatedUser ? relatedUser.name : '', // Assign the related user's name
              createdBy: creator ? creator.name : '',      // Assign the creator's name
            });
          }
        });

        // Update the state with unique names and transactions
        setNames(Array.from(nameSet));
        setCreatedByNames(Array.from(createdBySet)); // Set the created by names
        setTransactions(transactionsList);

      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions.');
      }
    };

    fetchTransactions();
  }, [userId]);

  // Filter transactions based on selected person, date range, and created by
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesPerson = searchPerson ? transaction.person === searchPerson : true;
    const matchesDateFrom = searchDateFrom ? new Date(transaction.date) >= new Date(searchDateFrom) : true;
    const matchesDateTo = searchDateTo ? new Date(transaction.date) <= new Date(searchDateTo) : true;
    const matchesCreatedBy = searchCreatedBy ? transaction.createdBy === searchCreatedBy : true;
    return matchesPerson && matchesDateFrom && matchesDateTo && matchesCreatedBy;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="transaction-list-container">
      <h2>Transactions List</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Search Bar */}
      <div className="filters">
        <label>
          Select Person:
          <select
            value={searchPerson}
            onChange={(e) => setSearchPerson(e.target.value)}  // Update searchPerson on change
          >
            <option value="">All Persons</option>
            {names.length > 0 ? (
              names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            ) : (
              <option>No available names</option>
            )}
          </select>
        </label>

        <label>
          From Date:
          <input
            type="date"
            value={searchDateFrom}
            onChange={(e) => setSearchDateFrom(e.target.value)}  // Update searchDateFrom on change
            max={new Date().toISOString().split("T")[0]}  // Max date cannot exceed today
          />
        </label>

        <label>
          To Date:
          <input
            type="date"
            value={searchDateTo}
            onChange={(e) => setSearchDateTo(e.target.value)}  // Update searchDateTo on change
            min={searchDateFrom}  // Min date cannot be before the "From" date
            max={new Date().toISOString().split("T")[0]}  // Max date cannot exceed today
          />
        </label>

        <label>
          Created by:
          <select
            value={searchCreatedBy}
            onChange={(e) => setSearchCreatedBy(e.target.value)}  // Update searchCreatedBy on change
          >
            <option value="">All Created By</option>
            {createdByNames.length > 0 ? (
              createdByNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))
            ) : (
              <option>No available names</option>
            )}
          </select>
        </label>
      </div>

      {/* Transaction Table */}
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Vendor</th>
            <th>Description</th>
            <th>Created by</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => {
              // Determine the person based on whether the logged-in user is the creator or the recipient
              const person =
                transaction.relatedUserId === userId
                  ? users.find(user => user.uid === transaction.userId)?.name  // Display creator's name if user is the recipient
                  : users.find(user => user.uid === transaction.relatedUserId)?.name;  // Otherwise, display the related user's name

              return (
                <tr key={transaction.id}>
                  <td>{person}</td>
                  <td>{transaction.date}</td>
                  <td>{transaction.type === 'credit' ? 'Credit' : 'Debit'}</td>
                  <td>${transaction.amount}</td>
                  <td>{transaction.vendor}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.createdBy}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Print Button */}
      <button className="print-button" onClick={handlePrint}>
        Print
      </button>  
    </div>
  );
};

export default TransactionList;
