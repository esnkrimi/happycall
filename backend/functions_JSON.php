<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

function edit($con)
{
  $data = $_GET['formInput'];
  $data = json_decode($data, true);
  $id = $_GET['fid'];
  $opId = $data['opId'];
  $tell = $data['tell'];
  $typehc = $data['typehc'];
  $datetime = $data['datetime'];
  $result = $data['result'];
  $opId = $data['opId'];
  $resultunsatisfying = $data['resultunsatisfying'];
  $repairDateTime = $data['repairDateTime'];
  $sql = "update failure set 
  tell='$tell', typehc='$typehc',result='$result' ,resultunsatisfying='$resultunsatisfying' 
  where
  id=$id";
  $result = $con->QUERY_RUN($con, $sql);
  echo ('[{"commited":"1"}]');
}




function delete($con)
{
  $id = $_GET['fid'];
  $sql = "delete  from failure where id=$id";
  if ($result = $con->QUERY_RUN($con, $sql)) {
    echo ('[{"commited":"1"}]');
  }
}

function fetchMyFailures($con)
{
  $id = $_GET['userid'];
  $sql = "SELECT  * from failure where userid='$id' order by id desc";
  if ($result = $con->QUERY_RUN($con, $sql)) {
    $resultArray = array();
    while ($row = $result->fetch_object()) {
      array_push($resultArray, $row);
    }
    $t = json_encode($resultArray);
    echo $t;
  }
}


function addRowFactor($con)
{
  $count = $_GET['count'];
  $price = $_GET['price'];
  $title = $_GET['title'];
  $cid = $_GET['cid'];
  $factorrowId = $con->GET_MAX_COL('factorrow', 'id');
  $result = $con->QUERY_RUN($con, $sql);
  $sql = "insert into factorrow values ($factorrowId,'$title',$price,$count,$cid)";
  echo $sql;
  echo ('[{"commited":"1"}]');
}


function submitFailure($con)
{
  $data = $_GET['formInput'];
  $data = json_decode($data, true);

  $opId = $data['opId'];
  $tell = $data['tell'];
  $typehc = $data['typehc'];
  $datetime = $data['datetime'];
  $result = $data['result'];
  $opId = $data['opId'];
  $resultunsatisfying = $data['resultunsatisfying'];
  $repairDateTime = $data['repairDateTime'];
  $id = $con->GET_MAX_COL('failure', 'id');
  $sql = "INSERT INTO failure
(id,userid, tell, typehc, datetime, result, resultunsatisfying, repairDateTime)
VALUES ($id,$opId,'$tell'
, '$typehc','$datetime' ,'$result' ,'$resultunsatisfying' ,'$repairDateTime' )";
  $result = $con->QUERY_RUN($con, $sql);
  echo ('[{"commited":"1"}]');
}

function login($con)
{
  $username = $_GET['username'];
  $password = $_GET['password'];
  $sql = "SELECT  id,name,family,type,tell,address from user where username='$username' and password='$password' ";
  if ($result = $con->QUERY_RUN($con, $sql)) {
    $resultArray = array();
    while ($row = $result->fetch_object()) {
      array_push($resultArray, $row);
    }
    $t = json_encode($resultArray);
    echo $t;
  }
}


?>