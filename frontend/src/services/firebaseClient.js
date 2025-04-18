import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence (optional but recommended for finance apps)
import { enableIndexedDbPersistence } from "firebase/firestore";

try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence
      console.log('Persistence not supported by this browser');
    } else {
      console.error("Error enabling offline persistence:", err);
    }
  });
  console.log("Offline persistence enabled");
} catch (error) {
  console.error("Error enabling offline persistence:", error);
}

// Test connection function (optional)
import { collection, addDoc, deleteDoc } from "firebase/firestore";

export const testFirestoreConnection = async () => {
  try {
    const testCollection = collection(db, "connection_test");
    const docRef = await addDoc(testCollection, {
      timestamp: new Date().toISOString(),
      test: "Connection successful"
    });
    console.log("Connection test successful, document ID:", docRef.id);

    // Clean up the test document
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Firestore connection test failed:", error);
    return false;
  }
};