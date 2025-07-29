<?php
if (isset($_POST['ingredients'])) {
    $input = strtolower(trim($_POST['ingredients']));
    $ingredients = array_map('trim', explode(',', $input));

    // Convert to a single string for simple matching
    sort($ingredients);
    $key = implode(',', $ingredients);

    // Hardcoded smart rules
    $recipes = [
        "onion,potato,tomato" => [
            "name" => "Aloo Tamatar Ki Sabzi",
            "ingredients" => ["Potatoes", "Tomatoes", "Onions", "Spices"],
            "steps" => "Boil potatoes, sauté onions and tomatoes, add spices and potatoes."
        ],
        "onion,paneer,tomato" => [
            "name" => "Paneer Masala",
            "ingredients" => ["Paneer", "Onions", "Tomatoes", "Cream"],
            "steps" => "Make onion-tomato gravy, add paneer cubes, cook with cream."
        ],
        "dal,rice" => [
            "name" => "Dal Chawal",
            "ingredients" => ["Rice", "Lentils", "Spices"],
            "steps" => "Boil rice. Cook dal with tadka. Serve hot."
        ]
    ];

    // Check if recipe matches
    if (isset($recipes[$key])) {
        $recipe = $recipes[$key];
        echo "<h2>{$recipe['name']}</h2>";
        echo "<h4>Ingredients:</h4><ul>";
        foreach ($recipe['ingredients'] as $ing) {
            echo "<li>$ing</li>";
        }
        echo "</ul><h4>Steps:</h4><p>{$recipe['steps']}</p>";
    } else {
        echo "Sorry, AI could not generate a recipe.<br>Try entering basic ingredients like: <b>onion, tomato, potato</b>";
    }
}
?>
