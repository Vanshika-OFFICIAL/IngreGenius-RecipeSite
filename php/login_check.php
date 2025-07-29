<?php
session_start();
include("db,php");

$email=$_POST['email'];
$pass=$_POST['password'];

$sql="SELECT * FROM users where email='$email' ";
$result=$conn->query($sql);

if($result->num_rows>0){
    $row=$result->fetch_assoc();
    if(password_verify($pass,$row['password'])){
    $_SESSION['user']=$row['name'];
    header("Location: ../dashboard.php");
}else{
    echo "Wrong Password";
}
}else{
    echo "User not found!";
}

$conn->close();
?>