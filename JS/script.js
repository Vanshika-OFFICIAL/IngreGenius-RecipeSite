const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search");
const outputBox = document.getElementById("recipe-output");
const favBtn = document.getElementById("favBtn");

document.addEventListener("DOMContentLoaded", () => {
  fetchDefaultRecipes();

  searchBtn.addEventListener("click", () => {
    const input = searchInput.value.trim();
    if (!input) return;

    const ingredients = input.split(",").map(i => i.trim().toLowerCase());
    outputBox.innerHTML = "<p>Searching...</p>";
    fetchRecipes(ingredients);
    fetchYouTubeVideos(input);
  });

  favBtn.addEventListener("click", () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        window.location.href = "favorites.html";
      } else {
        window.location.href = "signup.html";
      }
    });
  });
});

// Check if meal is favorited
async function isFavorited(id) {
  const user = firebase.auth().currentUser;
  if (!user) return false;
  const favDoc = await firebase.firestore()
    .collection("users").doc(user.uid)
    .collection("favorites").doc(id)
    .get();
  return favDoc.exists;
}

// Toggle favorite
async function toggleFavorite(id, name, image, category) {
  const user = firebase.auth().currentUser;
  if (!user) return window.location.href = "signup.html";

  const favRef = firebase.firestore()
    .collection("users").doc(user.uid)
    .collection("favorites").doc(id);
  const doc = await favRef.get();

  if (doc.exists) {
    await favRef.delete();
  } else {
    await favRef.set({ id, name, image, category });
  }

  fetchDefaultRecipes(); // Refresh cards
}

// Display Recipes + YouTube
async function displayRecipes(meals = [], videos = []) {
  if ((!meals.length) && (!videos.length)) {
    outputBox.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  let html = "";

  for (let i = 0; i < meals.length; i++) {
    if (i % 4 === 0) html += `<div class="row" style="display:flex; gap:20px; flex-wrap:wrap;">`;

    const isFav = await isFavorited(meals[i].idMeal);
    html += `
      <div class="recipe-card" style="flex: 1 1 23%; border:1px solid #ddd; padding:10px; border-radius:8px; text-align:center; max-width: 23%;">
        <img src="${meals[i].strMealThumb}" alt="${meals[i].strMeal}" style="width:100%; height:180px; object-fit:cover; border-radius:6px;">
        <h4>${meals[i].strMeal}</h4>
        <p><strong>Category:</strong> ${meals[i].strCategory}</p>
        <button class="fav-btn ${isFav ? 'active' : ''}"
          onclick="toggleFavorite('${meals[i].idMeal}', '${meals[i].strMeal}', '${meals[i].strMealThumb}', '${meals[i].strCategory}')">
          ${isFav ? '❤️ Favorited' : '🤍 Add to Favorite'}
        </button>
      </div>
    `;
    if ((i + 1) % 4 === 0 || i === meals.length - 1) html += `</div>`;
  }

  // 🎥 YouTube
  if (videos.length > 0) {
    html += `<h3 style="margin-top:30px;">🎥 YouTube Recipes</h3>`;
    html += `<div class="row" style="display:flex; flex-wrap:wrap; gap:20px;">`;

    videos.forEach(video => {
      const { title } = video.snippet;
      const thumbnail = video.snippet.thumbnails.medium.url;
      const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;

      html += `
        <div class="recipe-card" style="flex: 1 1 23%; border:1px solid #ccc; padding:10px; border-radius:8px; max-width: 23%;">
          <a href="${videoUrl}" target="_blank">
            <img src="${thumbnail}" alt="${title}" style="width:100%; border-radius:6px; height:180px; object-fit:cover;">
          </a>
          <p style="margin-top:10px;">${title}</p>
        </div>
      `;
    });

    html += `</div>`;
  }

  outputBox.innerHTML = html;
}

// 🍛 Indian default recipes
async function fetchDefaultRecipes() {
  try {
    const mealDbRes = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian");
    const mealDbData = await mealDbRes.json();
    const detailedMeals = await Promise.all(
      mealDbData.meals.map(meal =>
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
          .then(res => res.json()).then(res => res.meals[0])
      )
    );

    const ytRes = await fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&q=indian+recipes&type=video&maxResults=8&key=AIzaSyCNd1F_KzFHn0opLAsCXihAa8Dfofoq4sI");
    const ytData = await ytRes.json();

    await displayRecipes(detailedMeals, ytData.items);
  } catch (err) {
    outputBox.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
  }
}

// 🔍 Search recipes by ingredients
async function fetchRecipes(ingredients) {
  const primary = ingredients[0];
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${primary}`);
  const data = await res.json();

  if (!data.meals) {
    outputBox.innerHTML = `<p>No recipes found for "${ingredients.join(", ")}".</p>`;
    return;
  }

  const details = await Promise.all(
    data.meals.map(meal =>
      fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
        .then(res => res.json()).then(res => res.meals[0])
    )
  );

  const filtered = details.filter(meal => {
    const allowedAreas = ["indian", "chinese", "italian", "continental"];
    if (!allowedAreas.includes(meal.strArea.toLowerCase())) return false;

    const mealIngredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      if (ing) mealIngredients.push(ing.toLowerCase());
    }

    const matchIngredients = ingredients.every(i => mealIngredients.includes(i));
    return matchIngredients;
  });

  await displayRecipes(filtered);
}

// 🔎 YouTube Search
async function fetchYouTubeVideos(query) {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+recipes&type=video&maxResults=8&key=YOUR_YT_KEY`);
    const ytData = await response.json();
    await displayRecipes([], ytData.items);
  } catch (error) {
    console.error("YouTube fetch error:", error);
  }
}
