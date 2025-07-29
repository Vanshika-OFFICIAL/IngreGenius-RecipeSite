const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search");
const outputBox = document.getElementById("recipe-output");
const loginBtn = document.querySelector(".login-btn");
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchDefaultRecipes();

  searchBtn.addEventListener("click", async () => {
    const input = searchInput.value;
    if (!input.trim()) return;

    const ingredients = input.split(",").map(i => i.trim().toLowerCase());
    outputBox.innerHTML = "<p>Searching...</p>";

    fetchRecipes(ingredients);          // 🍲 Search recipes
    fetchYouTubeVideos(input);                   // 🎥 Search YouTube videos
  });

  // Fetch default Indian recipes + YT videos
  async function fetchDefaultRecipes() {
    try {
      const mealDbPromise = fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian");
      const ytPromise = fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&q=indian+recipes&type=video&maxResults=8&key=AIzaSyCNd1F_KzFHn0opLAsCXihAa8Dfofoq4sI");

      const [mealDbRes, ytRes] = await Promise.all([mealDbPromise, ytPromise]);
      const mealDbData = await mealDbRes.json();
      const ytData = await ytRes.json();

      const detailedMeals = await Promise.all(
        mealDbData.meals.map(meal =>
          fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
            .then(res => res.json())
            .then(res => res.meals[0])
        )
      );

      displayRecipes(detailedMeals, ytData.items);
    } catch (err) {
      outputBox.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
    }
  }

  // Fetch YouTube videos dynamically
  async function fetchYouTubeVideos(query) {
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+recipes&type=video&maxResults=8&key=AIzaSyAzmsQfI2CVpUdAKh-ZOOgCOnEoSmgJvjE`);
      const ytData = await response.json();
      displayRecipes([], ytData.items); // Only videos, no meals
    } catch (error) {
      console.error("YouTube fetch error:", error);
    }
  }

  // Search by ingredients
  async function fetchRecipes(ingredients) {
    let filters = [];
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
        .then(res => res.json())
        .then(res => res.meals[0])
    )
  );

  const filtered = details.filter(meal => {
    // ✅ include Indian,chinese,italian,continental recipes
const allowedAreas = ["indian", "chinese", "italian", "continental"];
if (!allowedAreas.includes(meal.strArea.toLowerCase())) return false;

    const mealIngredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      if (ing) mealIngredients.push(ing.toLowerCase());
    }

    const matchIngredients = ingredients.every(i => mealIngredients.includes(i));
    if (!matchIngredients) return false;

    

    if (filters.includes("nonveg")) {
      if (
        !meal.strMeal.toLowerCase().includes("chicken") &&
        !meal.strMeal.toLowerCase().includes("egg") &&
        !meal.strCategory.toLowerCase().includes("beef") &&
        !meal.strCategory.toLowerCase().includes("pork")
      ) return false;
    }

    if (filters.includes("gluten-free")) {
      if (meal.strTags && meal.strTags.toLowerCase().includes("gluten")) return false;
    }

    return true;
  });

  displayRecipes(filtered); // YouTube handled separately
}


  // Render recipe + video cards
  function displayRecipes(meals = [], videos = []) {
    if ((!meals || meals.length === 0) && (!videos || videos.length === 0)) {
      outputBox.innerHTML = "<p>No recipes found.</p>";
      return;
    }

    let html = "";

    // Meals (4 per row)
    for (let i = 0; i < meals.length; i++) {
      if (i % 4 === 0) html += `<div class="row" style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:20px;">`;
      html += `
        <div class="recipe-card" style="flex: 1 1 23%; border:1px solid #ddd; padding:10px; border-radius:8px; text-align:center; max-width: 23%;">
          <img src="${meals[i].strMealThumb}" alt="${meals[i].strMeal}" style="width:100%; border-radius:6px; height:180px; object-fit:cover;">
          <h4>${meals[i].strMeal}</h4>
          <p><strong>Category:</strong> ${meals[i].strCategory}</p>
          <button class="fav-btn ${isFavorited(meals[i].idMeal) ? 'active' : ''}" 
          onclick="toggleFavorite('${meals[i].idMeal}', '${meals[i].strMeal}', '${meals[i].strMealThumb}', '${meals[i].strCategory}')">
          ${isFavorited(meals[i].idMeal) ? '❤️ Favorited' : '🤍 Add to Favorite'}
</button>

        </div>
      `;
      if ((i + 1) % 4 === 0 || i === meals.length - 1) html += `</div>`;
    }

    // YouTube videos
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
});
function toggleFavorite(id, name, image, category) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  const index = favorites.findIndex(meal => meal.id === id);
  if (index !== -1) {
    favorites.splice(index, 1); // Remove
  } else {
    favorites.push({ id, name, image, category });
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  location.reload(); // 🔄 Refresh to update button UI
}

function isFavorited(id) {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  return favorites.some(meal => meal.id === id);
}
