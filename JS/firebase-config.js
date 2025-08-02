// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDav9PFDGG3FN_pU245W1a3sW85fRIWFC0",
  authDomain: "ingregenius-21466.firebaseapp.com",
  projectId: "ingregenius-21466",
  storageBucket: "ingregenius-21466.appspot.com", 
  messagingSenderId: "1089446808921",
  appId: "1:1089446808921:web:d65aabeff614a74fc2d048"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Make globally available
window.auth = auth;
window.db = db;