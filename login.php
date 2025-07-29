<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/login.css"/>
    <title>Login</title>
</head>
<body>
    <h2> Login to IngreGenius</h2>
    <form action="php/login_check.php" method="POST">
        <input type="email" name="email" placeholder="Email" required><br>
        <input type="password" name="password" placeholder="Password" required><br>
        <button type="submit">Login</button>
    </form>
    <p> Don't have an account? <a href="signup.php">Sign up here</a></p>
</body>
</html>