import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Client
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Export messaging asynchronously to ensure it's supported (e.g. not in Safari incognito)
export const messagingPromise = isSupported().then(supported => {
  if (supported) {
    return getMessaging(app);
  }
  return null;
});
