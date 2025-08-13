// Signup Logic
const form = document.getElementById("signup-form");
const email = document.getElementById("signup-email");
const password = document.getElementById("signup-password");
const errorMsg = document.getElementById("signup-error");

// Email/Password Signup
form.addEventListener("submit", (e) => {
  e.preventDefault();

  firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
      localStorage.setItem("loginTime", Date.now());
      alert("Account created successfully!");
      window.location.href = "index.html"; // Redirect to home
    })
    .catch((error) => {
      console.error(error.message);
      errorMsg.textContent = error.message;
    });
});

// Google Signup
const googleBtn = document.getElementById("google-signup");
googleBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      localStorage.setItem("loginTime", Date.now());
      alert("Signed up with Google!");
      window.location.href = "index.html"; // Redirect to home
    })
    .catch(error => {
      console.error(error.message);
      errorMsg.textContent = error.message;
    });
});