import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DEINE FIREBASE CONFIG
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

const firebaseConfig = {
  apiKey: "AIzaSyAr45W26PwENcqjhIxHa0rAKh5WO_7xq0w",
  authDomain: "logins-1.firebaseapp.com",
  projectId: "logins-1",
  storageBucket: "logins-1.firebasestorage.app",
  messagingSenderId: "705935420139",
  appId: "1:705935420139:web:643dac1b6b8ef02365acae",
  measurementId: "G-2H3V7N5LTT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
