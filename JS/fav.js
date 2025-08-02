document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = "signup.html"; // Redirect if not logged in
      return;
    }

    const favList = document.getElementById("favorites-list");
    const favRef = firebase.firestore()
      .collection("users").doc(user.uid)
      .collection("favorites");

    try {
      const snapshot = await favRef.get();
      if (snapshot.empty) {
        favList.innerHTML = "<p>No favorites yet.</p>";
        return;
      }

      let html = "";
      snapshot.forEach(doc => {
        const { name, image, category } = doc.data();
        html += `
          <div class="recipe-card" style="border:1px solid #ccc; padding:10px; width:23%; border-radius:8px;">
            <img src="${image}" alt="${name}" style="width:100%; height:180px; object-fit:cover; border-radius:6px;">
            <h4>${name}</h4>
            <p><strong>Category:</strong> ${category}</p>
            <button onclick="removeFavorite('${doc.id}')">❌ Remove</button>
          </div>
        `;
      });

      favList.innerHTML = html;

    } catch (error) {
      console.error("Error fetching favorites:", error);
      favList.innerHTML = "<p>Error loading favorites.</p>";
    }
  });
});

async function removeFavorite(id) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  await firebase.firestore()
    .collection("users").doc(user.uid)
    .collection("favorites").doc(id)
    .delete();

  location.reload(); // Reload after deletion
}
function filterFavorites() {
  const input = document.getElementById("searchFav").value.toLowerCase();
  const cards = document.querySelectorAll(".recipe-card");
  cards.forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(input) ? "block" : "none";
  });
}
