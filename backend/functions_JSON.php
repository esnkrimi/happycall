<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");


function fetchQ($con){
  $sql = "SELECT  * from questions";
  if ($result=$con->QUERY_RUN($con,$sql)	){
    $resultArray = array();
   while($row = $result->fetch_object()){
    array_push($resultArray, $row);    
   }
    $t=json_encode($resultArray);
     echo $t;
  } 
}

function edit($con){
$data=$_GET['formInput'];
$data = json_decode($data, true); 
$id=$_GET['fid'];
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
$result=$con->QUERY_RUN($con,$sql);
  echo('[{"commited":"1"}]');
}




function delete($con){
  $datetime=$_GET['datetime'];
  $userid=$_GET['userid'];
  $tell=$_GET['tell'];
  $sql = "delete  from failure where tell='$tell' and datetime='$datetime' and userid='$userid'";
  if ($result=$con->QUERY_RUN($con,$sql)	){
        echo('[{"commited":"1"}]');
  }
}

function fetchMyFailures($con){
  $id=$_GET['userid'];
  $sql = "  SELECT distinct userid,tell,datetime from failure  left join questions on   questions.id=failure.qid and  userid='1' order by failure.id desc";//echo $sql;
  if ($result=$con->QUERY_RUN($con,$sql)	){
    $resultArray = array();
   while($row = $result->fetch_object()){
    array_push($resultArray, $row);    
   }
    $t=json_encode($resultArray);
     echo $t;
  } 
}


function addRowFactor($con){
  $count=$_GET['count'];
  $price=$_GET['price'];
  $title=$_GET['title'];
  $cid=$_GET['cid'];
  $factorrowId=$con->GET_MAX_COL('factorrow','id');
  $result=$con->QUERY_RUN($con,$sql);
  $sql = "insert into factorrow values ($factorrowId,'$title',$price,$count,$cid)";echo $sql;
  echo('[{"commited":"1"}]');
}


function submitFailure($con){
$data=$_POST['formInput'];
$data = json_decode($data, true); 

foreach ($data as $row) {

    $id = $con->GET_MAX_COL('failure', 'id');
$datetime = date("Y-m-d H:i:s");

    $sql = "INSERT INTO failure
    (id, userid, tell, datetime, score, ratescore,qid)
    VALUES (
        $id,
        '{$row['userid']}',
        '{$row['tell']}',
        '$datetime',
        '{$row['score']}',
        '{$row['ratescore']}',
        '{$row['id']}'
    )";
  $result=$con->QUERY_RUN($con,$sql);
}
  echo('[{"commited":"1"}]');

}

function login($con){
  $username=$_GET['username'];
  $password=$_GET['password'];
  $sql = "SELECT  id,level,name,family,type,tell,address from user where username='$username' and password='$password' ";
  if ($result=$con->QUERY_RUN($con,$sql)	){
    $resultArray = array();
   while($row = $result->fetch_object()){
    array_push($resultArray, $row);    
   }
    $t=json_encode($resultArray);
     echo $t;
  } 
}


?>
  