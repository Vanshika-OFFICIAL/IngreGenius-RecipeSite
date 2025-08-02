// search.js

async function trackSearch(keyword) {
  const user = auth.currentUser;
  if (!user) return;

  const activityRef = db.collection("user_activity").doc(user.uid);
  await activityRef.set({
    lastSearch: keyword,
    lastSearchAt: new Date()
  }, { merge: true });
}

window.trackSearch = trackSearch;
