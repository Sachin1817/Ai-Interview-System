import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjvKm3B5UJcpI--2TI2mypT1x_VUsgbsQ",
  authDomain: "ai-interview-system-2b56f.firebaseapp.com",
  projectId: "ai-interview-system-2b56f",
  storageBucket: "ai-interview-system-2b56f.firebasestorage.app",
  messagingSenderId: "746758724448",
  appId: "1:746758724448:web:631e1c988e3bec54091c05",
  measurementId: "G-HB3N5CY2XX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export default app;