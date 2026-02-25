import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXU8-GVzrlodHma6EWZMF46iHtM2lXi00",
  authDomain: "pp-personal-website.firebaseapp.com",
  projectId: "pp-personal-website",
  storageBucket: "pp-personal-website.firebasestorage.app",
  messagingSenderId: "524123414788",
  appId: "1:524123414788:web:849f4004cadeef4d3df051",
  measurementId: "G-ZM32WS52PD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
