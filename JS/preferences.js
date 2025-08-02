async function fetchUserPreferences() {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = db.collection("user_preferences").doc(user.uid);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const preferences = docSnap.data();
    console.log("User preferences:", preferences);
    // showRecipesBasedOn(preferences);
  } else {
    console.log("No preferences saved yet.");
  }
}

window.fetchUserPreferences = fetchUserPreferences;
