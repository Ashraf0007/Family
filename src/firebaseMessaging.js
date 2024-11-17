// src/firebaseMessaging.js
import { messaging } from './firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';

const VAPID_KEY = 'BOnJ8BENYrvBWRHHbXLG4YUJ2sx14bHxy7JCgaUitp-KQ4wjBTdb_x2J-8CMqzcc3fFCDhPRNyDC4Fh59lLV1jo'; // Replace with your actual VAPID key

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const status = await Notification.requestPermission();
    if (status === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // Save this token to your backend or database for later use
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Permission not granted for notifications');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
  }
};

// Handle incoming messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
