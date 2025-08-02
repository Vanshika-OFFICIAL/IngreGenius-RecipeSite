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
