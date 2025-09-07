# 🍽️ IngreGenius – Smart Recipe Finder

**IngreGenius** is a smart ingredient-based recipe recommendation web app that helps users discover delicious dishes from around the world. Powered by **TheMealDB API** and enhanced with **AI-powered suggestions**, it also integrates **YouTube cooking tutorials** for a complete cooking experience.

---
## Live Demo

Check out the live demo of this project here: [Live Demo](https://ingregenius.netlify.app/)

## ✨ Features

* 🔍 **Ingredient-based search** – Enter ingredients and get matching recipes
* 🍛 **Cuisine variety** – Explore Indian, Chinese, Italian, Continental & more
* 🥗 **Filters** – Veg, Non-Veg, Gluten-Free options
* ❤️ **Favorites** – Save recipes & videos with Firebase Authentication + Firestore
* 🎥 **YouTube integration** – Watch step-by-step cooking tutorials
* ⏳ **Session-based login** – Secure login with auto session expiry after 12 hrs
* 📱 **Responsive UI** – Works seamlessly across devices

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Frameworks:** Bootstrap
* **Backend/Database:** Firebase Authentication + Firestore
* **APIs:**

  * [TheMealDB](https://www.themealdb.com/) – Recipes & Ingredients
  * [YouTube Data API](https://developers.google.com/youtube/v3) – Video Tutorials

---

## 🚀 How to Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Vanshika-OFFICIAL/IngreGenius-RecipeSite.git
   ```

2. Navigate to the project folder:

   ```bash
   cd IngreGenius-RecipeSite
   ```

3. Open `index.html` in your browser.

---

## 📂 Project Structure

```
📦 IngreGenius-RecipeSite
 ┣ 📂 css/           # Stylesheets  
 ┣ 📂 js/            # Scripts (API calls, auth, filters)  
 ┣ 📂 images/        # Assets  
 ┣ 📂 pages/         # Signup, Favorites, Popup, etc.  
 ┣ index.html        # Main landing page  
 ┗ README.md
```

---

## 🔒 Security Notes

* API keys (e.g., YouTube) should be kept in backend or Firebase Functions – avoid exposing them in frontend.
* Firestore rules should restrict access per user.

---

## 📜 License

This project is for **educational & personal use** only.
All trademarks belong to their respective owners.

---

⚡ Crafted with ❤️ by [Vanshika](https://github.com/Vanshika-OFFICIAL)
