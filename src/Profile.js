// src/Profile.js
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Fetch user data on component load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUserData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Save updated user data
  const handleSave = async () => {
    if (!userData.name) {
      setError('Name cannot be empty');
      return;
    }
    setError('');
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { name: userData.name, phone: userData.phone });
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle password change submit
  const handleChangePasswordSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    try {
      const user = auth.currentUser;
      const credentials = EmailAuthProvider.credential(user.email, currentPassword);

      await reauthenticateWithCredential(user, credentials);
      await updatePassword(user, newPassword);

      setMessage('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your current password.');
    }
  };

  // Handle cancel password change
  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setMessage('');
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={userData.email} disabled />
      </div>
      <div>
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={userData.phone || ''}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>
      <button onClick={handleSave}>Save</button>

      {!isChangingPassword ? (
        <button onClick={() => setIsChangingPassword(true)}>Change Password</button>
      ) : (
        <>
          <div>
            <label>Current Password:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
          </div>
          <button onClick={handleChangePasswordSubmit}>Submit</button>
          <button onClick={handleCancelPasswordChange}>Cancel</button>
        </>
      )}
    </div>
  );
};

export default Profile;
