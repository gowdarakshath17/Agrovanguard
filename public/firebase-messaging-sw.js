importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "substantial-yucca-d7c1c",
  appId: "1:942949446669:web:f7b49e1eb1f299b844d144",
  apiKey: "AIzaSyB0NKtxzUinGengS-upM52KAPVlLw4-cNI",
  authDomain: "substantial-yucca-d7c1c.firebaseapp.com",
  storageBucket: "substantial-yucca-d7c1c.firebasestorage.app",
  messagingSenderId: "942949446669"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'CropSentinel Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'New alert from CropSentinel.',
    icon: '/icon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
