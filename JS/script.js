// ---------------------
// GLOBAL VARIABLES
// ---------------------
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search");
const outputBox = document.getElementById("recipe-output");
const favBtn = document.getElementById("favBtn");
const filterSelect = document.getElementById("filter-select");
const YT_API_KEY = "AIzaSyCNd1F_KzFHn0opLAsCXihAa8Dfofoq4sI";

// ---------------------
// RUN AFTER DOM LOAD
// ---------------------
document.addEventListener("DOMContentLoaded", () => {
  // ✅ Firebase Login State Check
  firebase.auth().onAuthStateChanged((user) => {
    const loginTime = localStorage.getItem("loginTime");
    const now = Date.now();

    if (!user) {
      window.location.href = "../Pages/signup.html"; // Not logged in
    } else if (loginTime) {
      const hoursPassed = (now - loginTime) / (1000 * 60 * 60);
      if (hoursPassed >= 12) {
        firebase.auth().signOut().then(() => {
          localStorage.removeItem("loginTime");
          alert("Session expired. Please log in again.");
          window.location.href = "../Pages/login.html";
        });
      } else {
        fetchDefaultRecipes(); // ✅ Preload recipes
      }
    } else {
      firebase.auth().signOut().then(() => {
        alert("Session expired. Please log in again.");
        window.location.href = "./Pages/signup.html";
      });
    }
  });

  // ✅ Search Button Click
  if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
      const input = searchInput.value.trim();
      if (!input) return;

      const ingredients = input.split(",").map(i => i.trim().toLowerCase());
      outputBox.innerHTML = "<p>Searching...</p>";
      try {
        const [meals, videos] = await Promise.all([
          fetchRecipes(ingredients),
          fetchYouTubeVideos(input),
        ]);
        await displayRecipes(meals, videos);
      } catch (error) {
        console.error("Search error:", error);
        outputBox.innerHTML = "<p>Error while searching. Please try again.</p>";
      }
    });
  }

  // ✅ Favorites Button Click
  if (favBtn) {
    favBtn.addEventListener("click", () => {
      firebase.auth().onAuthStateChanged((user) => {
        window.location.href = user ? "favorites.html" : "signup.html";
      });
    });
  }

  // ✅ Filter Select Change
  if (filterSelect) {
    filterSelect.addEventListener("change", async (e) => {
      const selected = e.target.value;
      outputBox.innerHTML = "<p>Filtering recipes...</p>";

      try {
        let filteredMeals = [];
        if (selected === "veg") {
          filteredMeals = await fetchVegRecipes();
        } else if (selected === "nonveg") {
          filteredMeals = await fetchNonVegRecipes();
        } else if (selected === "gluten-free") {
          filteredMeals = await fetchGlutenFreeRecipes();
        } else {
          await fetchDefaultRecipes();
          return;
        }

        const keywords = filteredMeals.slice(0, 5).map(m => m.strMeal).join(", ");
        const videos = await fetchYouTubeVideos(keywords);
        await displayRecipes(filteredMeals, videos);
      } catch (err) {
        console.error("Filter error:", err);
        outputBox.innerHTML = "<p>Error filtering recipes.</p>";
      }
    });
  }
});

// ---------------------
// FAVORITES FUNCTIONS
// ---------------------
async function isFavorited(id) {
  const user = firebase.auth().currentUser;
  if (!user) return false;
  const favDoc = await firebase.firestore()
    .collection("users").doc(user.uid)
    .collection("favorites").doc(id).get();
  return favDoc.exists;
}

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
  fetchDefaultRecipes(); // Refresh
}

// ---------------------
// DISPLAY RECIPES
// ---------------------
async function displayRecipes(meals = [], videos = []) {
  if (!meals.length && !videos.length) {
    outputBox.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  let html = "";

  // 🍛 Meal Cards
  for (let i = 0; i < meals.length; i++) {
    if (i % 4 === 0) html += `<div class="row" style="display:flex; gap:20px; flex-wrap:wrap;">`;

    const isFav = await isFavorited(meals[i].idMeal);
    html += `
      <div class="recipe-card" style="flex: 1 1 23%; border:1px solid #ddd; padding:10px; border-radius:8px; text-align:center; max-width: 23%; cursor:pointer;"
        onclick="showRecipeDetails('${meals[i].idMeal}')">
        <img src="${meals[i].strMealThumb}" alt="${meals[i].strMeal}" style="width:100%; height:180px; object-fit:cover; border-radius:6px;">
        <h4>${meals[i].strMeal}</h4>
        <p><strong>Category:</strong> ${meals[i].strCategory}</p>
        <button class="fav-btn ${isFav ? "active" : ""}" onclick="event.stopPropagation(); toggleFavorite('${meals[i].idMeal}', '${meals[i].strMeal}', '${meals[i].strMealThumb}', '${meals[i].strCategory}')">
          ${isFav ? "❤️ Favorited" : "🤍 Add to Favorite"}
        </button>
      </div>
    `;
    if ((i + 1) % 4 === 0 || i === meals.length - 1) html += `</div>`;
  }

  // 🎥 YouTube Cards
  if (videos.length > 0) {
    html += `<h3 style="margin-top:30px;">🎥 YouTube Recipes</h3>`;
    html += `<div class="row" style="display:flex; flex-wrap:wrap; gap:20px;">`;

    for (const video of videos) {
      const { title } = video.snippet;
      const thumbnail = video.snippet.thumbnails.medium.url;
      const videoId = video.id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const isFav = await isFavorited(videoId);

      html += `
        <div class="recipe-card" style="flex: 1 1 23%; border:1px solid #ccc; padding:10px; border-radius:8px; max-width: 23%; text-align:center;">
          <a href="${videoUrl}" target="_blank">
            <img src="${thumbnail}" alt="${title}" style="width:100%; border-radius:6px; height:180px; object-fit:cover;">
          </a>
          <p style="margin-top:10px;">${title}</p>
          <button class="fav-btn ${isFav ? "active" : ""}" onclick="toggleFavorite('${videoId}', '${title}', '${thumbnail}', 'YouTube')">
            ${isFav ? "❤️ Favorited" : "🤍 Add to Favorite"}
          </button>
        </div>
      `;
    }

    html += `</div>`;
  }

  outputBox.innerHTML = html;
}

// ---------------------
// FETCH FUNCTIONS
// ---------------------
async function fetchDefaultRecipes() {
  const cuisines = ["Indian", "Chinese", "Italian", "Continental", "German"];
  const allDetailedMeals = [];

  try {
    const cuisineFetches = cuisines.map(cuisine =>
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`)
        .then(res => res.json())
        .then(data => data.meals || [])
    );

    const cuisineResults = await Promise.all(cuisineFetches);
    const allMeals = cuisineResults.flat();
    const detailedMeals = await Promise.all(
      allMeals.map(meal =>
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
          .then(res => res.json())
          .then(data => data.meals[0])
      )
    );

    allDetailedMeals.push(...detailedMeals);

    const keywords = detailedMeals.slice(0, 5).map(meal => meal.strMeal).join(", ");
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keywords)}+recipes&type=video&maxResults=8&key=${YT_API_KEY}`
    );
    const ytData = await ytRes.json();

    await displayRecipes(allDetailedMeals, ytData.items);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    outputBox.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
  }
}

async function fetchRecipes(ingredients) {
  const primary = ingredients[0];
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${primary}`);
  const data = await res.json();
  if (!data.meals) return [];

  const details = await Promise.all(
    data.meals.map(meal =>
      fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
        .then(res => res.json())
        .then(res => res.meals[0])
    )
  );

  const allowedAreas = ["indian", "chinese", "italian", "continental"];
  return details
    .map(meal => {
      const mealIngredients = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        if (ing) mealIngredients.push(ing.toLowerCase());
      }
      const matchCount = ingredients.filter(i => mealIngredients.includes(i)).length;
      return { ...meal, matchCount };
    })
    .filter(meal => allowedAreas.includes(meal.strArea.toLowerCase()) && meal.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);
}

async function fetchYouTubeVideos(query) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+recipes&type=video&maxResults=8&key=${YT_API_KEY}`
    );
    const ytData = await response.json();
    return ytData.items;
  } catch (error) {
    console.error("YouTube fetch error:", error);
    return [];
  }
}

async function fetchVegRecipes() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Vegetarian");
  const data = await res.json();
  return Promise.all(data.meals.map(meal =>
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
      .then(res => res.json())
      .then(data => data.meals[0])
  ));
}

async function fetchNonVegRecipes() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef");
  const data = await res.json();
  return Promise.all(data.meals.map(meal =>
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
      .then(res => res.json())
      .then(data => data.meals[0])
  ));
}

async function fetchGlutenFreeRecipes() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Miscellaneous");
  const data = await res.json();
  return Promise.all(data.meals.map(meal =>
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
      .then(res => res.json())
      .then(data => data.meals[0])
  ));
}

// ---------------------
// POPUP FUNCTIONS
// ---------------------
function closePopup() {
  document.getElementById("recipe-popup").style.display = "none";
}

async function showRecipeDetails(mealId) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
  const data = await res.json();
  const meal = data.meals[0];

  document.getElementById("popup-img").src = meal.strMealThumb;
  document.getElementById("popup-title").textContent = meal.strMeal;
  document.getElementById("popup-instructions").textContent = meal.strInstructions;

  const ingredientsList = document.getElementById("popup-ingredients");
  ingredientsList.innerHTML = "";

  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const li = document.createElement("li");
      li.textContent = `${ing} - ${measure}`;
      ingredientsList.appendChild(li);
    }
  }
  document.getElementById("recipe-popup").style.display = "flex";
}
