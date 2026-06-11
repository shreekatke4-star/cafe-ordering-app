// ============================================================
//   FIREBASE CONFIG — cafe-ordering-app-df3f4
//  Project: Brew & Bites Cafe Ordering App
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvvC44pFjrOA7zjdiT58FcD9jhRRpff4s",
  authDomain: "cafe-ordering-app-df3f4.firebaseapp.com",
  projectId: "cafe-ordering-app-df3f4",
  storageBucket: "cafe-ordering-app-df3f4.firebasestorage.app",
  messagingSenderId: "310742974435",
  appId: "1:310742974435:web:651ddf04f04f83c8b4ead6",
  measurementId: "G-PLBJTRKEC5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
