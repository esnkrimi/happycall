<?php
ini_set('display_errors', '1');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
include("connection.php");
include("functions_JSON.php");
$con = new connection;
$link = $con->CONNECT_DB();
if (mysqli_connect_errno())
    echo "Failed to connect to db: ";
$id = $_GET['id'];
$uid = $_GET['uid'];

if ($id == 1)
    login($con);
if ($id == 2)
    submitFailure($con);
if ($id == 3)
    fetchMyFailures($con);
if ($id == 4)
    addFactor($con);
if ($id == 5)
    removeFactor($con);
if ($id == 6)
    editRowFactor($con);
if ($id == 7)
    addRowFactor($con);
if ($id == 8)
    setPrepay($con);



$link->close();
?>