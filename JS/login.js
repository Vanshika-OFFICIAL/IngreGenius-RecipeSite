// Your Firebase config
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
const db = firebase.firestore();

// Inputs
const email = document.getElementById("login-email");
const password = document.getElementById("login-password");
const submitBtn = document.getElementById("login-submit");
const errorMsg = document.getElementById("login-error");

// Click listener
submitBtn.addEventListener("click", function(event) {
  event.preventDefault();

  const emailVal = email.value.trim();
  const passwordVal = password.value;

  if (!emailVal || !passwordVal) {
    errorMsg.textContent = "Please fill all fields.";
    return;
  }

  // Firebase login
  auth.signInWithEmailAndPassword(emailVal, passwordVal)
    .then((userCredential) => {
      localStorage.setItem("loginTime", Date.now());
      alert("Logged in successfully!");
      window.location.href = "index.html"; // Redirect to home
    })
    .catch((error) => {
      console.error(error.code, error.message);
      errorMsg.textContent = "Login failed. Please check your credentials.";
    });
});