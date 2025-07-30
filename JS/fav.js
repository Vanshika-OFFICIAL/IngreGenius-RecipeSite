import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, doc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

const favoritesList = document.getElementById("favorites-list");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const favRef = collection(db, "users", user.uid, "favorites");
    const snapshot = await getDocs(favRef);

    if (snapshot.empty) {
      favoritesList.innerHTML = "<p>No favorites added yet!</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const recipe = doc.data();
      const card = `
        <div class="recipe-card">
          <img src="${recipe.image}" alt="${recipe.name}" />
          <h4>${recipe.name}</h4>
          <p>${recipe.category}</p>
          <a href="${recipe.link}" target="_blank">View Recipe</a>
        </div>
      `;
      favoritesList.innerHTML += card;
    });
  } else {
    window.location.href = "signup.html";
  }
});
