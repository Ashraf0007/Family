// src/TransactionForm.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import './TransactionForm.css';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    person: '',
    date: '',
    type: 'credit',
    amount: '',
    vendor: '',
    description: ''
  });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = collection(db, 'users');
        const userSnapshot = await getDocs(userCollection);
        const userList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        const loggedInUserId = auth.currentUser?.uid;

        if (!loggedInUserId) {
          setMessage('You must be logged in to record a transaction.');
          return;
        }

        const filteredUsers = userList.filter(user => user.uid !== loggedInUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setMessage('Failed to load users.');
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (!formData.person || !formData.date || !formData.amount) {
        setMessage('Please fill out all required fields.');
        return;
      }

      const userId = auth.currentUser?.uid;
      if (!userId) {
        setMessage('You must be logged in to add a transaction.');
        return;
      }

      const selectedUser = users.find(user => user.name === formData.person);
      const transactionData = {
        ...formData,
        userId,
        relatedUserId: selectedUser?.uid, // Include related user's UID
        timestamp: new Date()
      };

      await addDoc(collection(db, 'transactions'), transactionData);
      setMessage('Transaction recorded successfully!');
      setFormData({ person: '', date: '', type: 'credit', amount: '', vendor: '', description: '' });
    } catch (error) {
      console.error('Error adding transaction:', error);
      setMessage('Failed to record transaction. Try again.');
    }
  };

  return (
    <div className="transaction-form-container">
      <form className="transaction-form" onSubmit={handleSubmit}>
        <h2>Record a Transaction</h2>
        {message && <p className="message">{message}</p>}

        <label>
          Person:
          <select name="person" value={formData.person} onChange={handleChange} required>
            <option value="">Select a Person</option>
            {users.map((user, index) => (
              <option key={index} value={user.name}>{user.name}</option>
            ))}
          </select>
        </label>
        <label>
          Date:
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </label>
        <label>
          Type:
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </label>
        <label>
          Amount:
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
        </label>
        <label>
          Vendor:
          <input type="text" name="vendor" value={formData.vendor} onChange={handleChange} />
        </label>
        <label>
          Description:
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TransactionForm;
