<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");



function fetchPreviousLayer($con)
{
  $level = $_GET['level'];
  $sql = "SELECT DISTINCT
    t1.tell,
    t1.types,
    t1.datetime,
    t1.layer,
    t1.refrence,
    t1.userid
FROM failure_h t1
WHERE t1.layer = $level-1
  AND NOT EXISTS (
      SELECT 1
      FROM failure_h t2
      WHERE t2.tell = t1.tell
        AND t2.layer = $level
  )";
  //echo $sql;
  if ($result = $con->QUERY_RUN($con, $sql)) {
    $resultArray = array();
    while ($row = $result->fetch_object()) {
      $userid = $row->userid;
      $row->userinfo = fetchUserByID($con, $userid);
      array_push($resultArray, $row);
    }
    $t = json_encode($resultArray);
    echo $t;
  }
}
function updateDontRefre($con)
{
  $tell = $_GET['tell'];
  $user_id = $_GET['userid'];
  $pey_name = $_GET['pey_name'];
  $pey_qrcode = $_GET['pey_qrcode'];
  $ticket_number = $_GET['ticket_number'];
  $ticket_date = $_GET['ticket_date'];
  $id = $con->GET_MAX_COL('failure_h', 'id');
  $sql = "INSERT INTO failure_h
(id, userid, tell, datetime, score, ratescore,qid,modelresult,types,pey_qrcode,pey_name,refrence,ticket_number,ticket_date)
VALUES ($id,$user_id,$tell,'','','',0,'','','$pey_qrcode','$pey_name',0,'$ticket_number','$ticket_date')";
  //echo $sql;
  $result = $con->QUERY_RUN($con, $sql);
  echo ('[{"commited":"1"}]');
}
function fetchQ($con)
{
  $type = $_GET['type'];
  $level = $_GET['level'];
  if (strcmp($type, 'خرابی') == 0)
    $sqlAd = '';
  else
    $sqlAd = "and  type<>'خرابی'";
  $sql = "SELECT  * from questions_h where qsid>0  $sqlAd and level=$level"; //echo $sql;
  if ($result = $con->QUERY_RUN($con, $sql)) {
    $resultArray = array();
    while ($row = $result->fetch_object()) {
      array_push($resultArray, $row);
    }
    $t = json_encode($resultArray);
    echo $t;
  }
}

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
  $sql = "update failure_h set 
  tell='$tell', typehc='$typehc',result='$result' ,resultunsatisfying='$resultunsatisfying' 
  where
  id=$id";
  $result = $con->QUERY_RUN($con, $sql);
  echo ('[{"commited":"1"}]');
}




function delete($con)
{
  $datetime = $_GET['datetime'];
  $userid = $_GET['userid'];
  $tell = $_GET['tell'];
  $sql = "delete  from failure_h where tell='$tell' and datetime='$datetime' and userid='$userid'";
  if ($result = $con->QUERY_RUN($con, $sql)) {
    echo ('[{"commited":"1"}]');
  }
}

function fetchMyFailures($con)
{
  $id = $_GET['userid'];
  if ($id == 1)
    $sql = "
SELECT *
FROM failure_h
JOIN questions_h ON failure_h.qid = questions_h.qsid
where refrence=1
ORDER BY failure_h.id DESC";
  else
    $sql = "
SELECT *
FROM failure_h
JOIN questions_h ON failure_h.qid = questions_h.qsid
WHERE refrence=1
ORDER BY failure_h.id DESC";
  //echo $sql; failure_h.userid = $id and 

  if ($result = $con->QUERY_RUN($con, $sql)) {
    $resultArray = array();
    while ($row = $result->fetch_object()) {
      $userid = $row->userid;
      $row->userinfo = fetchUserByID($con, $userid);
      array_push($resultArray, $row);
    }
    $t = json_encode($resultArray);
    echo $t;
  }
}

function fetchDontRefrence($con)
{

  $id = $_GET['userid'];
  if ($id == 1)
    $sql = "
SELECT *
FROM failure_h
where refrence=0
ORDER BY failure_h.id DESC";
  else
    $sql = "
SELECT *
FROM failure_h
WHERE userid = $id and refrence=0
ORDER BY failure_h.id DESC";
  if ($result = $con->QUERY_RUN($con, $sql)) {
    $resultArray = array();
    while ($row = $result->fetch_object()) {
      $userid = $row->userid;
      $row->userinfo = fetchUserByID($con, $userid);
      array_push($resultArray, $row);
    }
    $t = json_encode($resultArray);
    echo $t;
  }
}



function fetchUserByID($con, $userid)
{
  $sql = "SELECT * from user_h where id=$userid";//echo $sql;
  if ($result = $con->QUERY_RUN($con, $sql)) {
    $resultArray = array();
    while ($row = $result->fetch_object()) {
      array_push($resultArray, $row);


    }
    return $resultArray;
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
  echo ('[{"commited":"1"}]');
}


function submitFailure($con)
{
  error_reporting(E_ALL);
  ini_set('display_errors', 1);

  $data = $_POST['formInput'];
  $type = $_GET['type'];
  $level = $_GET['level'];
  $data = json_decode($data, true);
  foreach ($data as $row) {
    $id = $con->GET_MAX_COL('failure_h', 'id');
    $date = new DateTime();
    $date = $date->format('Y-m-d H:i:s');
    $sql = "INSERT INTO failure_h
    (id, userid, tell, datetime, score, ratescore,qid,types,pey_qrcode,pey_name,refrence,ticket_number,ticket_date,modelresult,layer)
    VALUES (
        $id,
        '{$row['userid']}',
        '{$row['tell']}',
        '$date',
        '{$row['score']}',
        '{$row['ratescore']}',
        '{$row['qsid']}',
        '$type',
        '{$row['pey_qrcode']}',
        '{$row['pey_name']}',1,
        '{$row['ticket_number']}',
        '{$row['ticket_date']}',
        '',
        '{$row['level']}'
    )";
    $result = $con->QUERY_RUN($con, $sql);
  }
  echo ('[{"commited":"1"}]');

}

function login($con)
{
  $username = $_GET['username'];
  $password = $_GET['password'];
  $sql = "SELECT  id,level,name,family,type,tell,address from user_h where username='$username' and password='$password' ";
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