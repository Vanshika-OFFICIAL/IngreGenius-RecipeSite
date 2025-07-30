// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDav9PFDGG3FN_pU245W1a3sW85fRIWFC0",
  authDomain: "ingregenius-21466.firebaseapp.com",
  projectId: "ingregenius-21466",
  storageBucket: "ingregenius-21466.firebasestorage.app",
  messagingSenderId: "1089446808921",
  appId: "1:1089446808921:web:d65aabeff614a74fc2d048"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Signup Logic
const form = document.getElementById("signup-form");
const email = document.getElementById("signup-email");
const password = document.getElementById("signup-password");
const errorMsg = document.getElementById("signup-error");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
      alert("Account created successfully!");
      // Optional: Redirect to login or homepage
      // window.location.href = "login.html";
    })
    .catch((error) => {
      console.error(error.message);
      errorMsg.textContent = error.message;
    });
});
