<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

function chart($conn)
{

    $level = isset($_GET['level'])
        ? (int)$_GET['level']
        : 0;


    $sqlUsers = "
        SELECT
            u.id AS userid,

            CONCAT(
                COALESCE(u.name, ''),
                ' ',
                COALESCE(u.family, '')
            ) AS username,

            COUNT(f.id) AS total,

            SUM(
                CASE
                    WHEN LOWER(TRIM(f.score)) IN (
                        'بله',
                        'عالی',
                        'خوب'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS satisfied,

            SUM(
                CASE
                    WHEN LOWER(TRIM(f.score)) IN (
                        'خیر',
                        'ضعیف'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS unsatisfied

        FROM user_h u

        LEFT JOIN (
            SELECT
                f.*
            FROM failure_h f

            INNER JOIN questions_h q
                ON q.qsid = f.qid

            WHERE q.level = $level
        ) f
            ON f.userid = u.id

        WHERE u.level = $level

        GROUP BY
            u.id,
            u.name,
            u.family

        ORDER BY total DESC
    ";

    $users = [];

    $stmt = $conn->QUERY_RUN($conn, $sqlUsers);

    if ($stmt) {

        while ($row = $stmt->fetch_assoc()) {

            $total =
                (int)$row['total'];

            $satisfied =
                (int)$row['satisfied'];

            $unsatisfied =
                (int)$row['unsatisfied'];

            $satisfactionPercent =
                $total > 0
                ? ($satisfied / $total) * 100
                : 0;

            $users[] = [

                'userid' =>
                    (int)$row['userid'],

                'username' =>
                    trim($row['username']),

                'total' =>
                    $total,

                'satisfied' =>
                    $satisfied,

                'unsatisfied' =>
                    $unsatisfied,

                'satisfactionPercent' =>
                    round(
                        $satisfactionPercent,
                        1
                    )
            ];
        }
    }


    // =========================================================
    // QUESTIONS
    // =========================================================

    $sqlQuestions = "
        SELECT

            q.qsid AS qid,

            q.title,

            q.model,

            COUNT(f.id) AS total,

            SUM(
                CASE
                    WHEN LOWER(TRIM(f.score)) IN (
                        'بله',
                        'عالی',
                        'خوب'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS satisfied,

            SUM(
                CASE
                    WHEN LOWER(TRIM(f.score)) IN (
                        'خیر',
                        'ضعیف'
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS unsatisfied

        FROM questions_h q

        LEFT JOIN failure_h f
            ON f.qid = q.qsid

        WHERE q.level = $level

        GROUP BY
            q.qsid,
            q.title,
            q.model

        ORDER BY
            q.qsid
    ";

    $questions = [];

    $totalAnswers = 0;

    $totalSatisfied = 0;


    $stmt = $conn->QUERY_RUN(
        $conn,
        $sqlQuestions
    );


    if ($stmt) {

        while ($row = $stmt->fetch_assoc()) {

            $total =
                (int)$row['total'];

            $satisfied =
                (int)$row['satisfied'];

            $unsatisfied =
                (int)$row['unsatisfied'];


            $satisfactionPercent =
                $total > 0
                ? ($satisfied / $total) * 100
                : 0;


            $questions[] = [

                'qid' =>
                    (int)$row['qid'],

                'title' =>
                    $row['title'],

                'model' =>
                    $row['model'],

                'total' =>
                    $total,

                'satisfied' =>
                    $satisfied,

                'unsatisfied' =>
                    $unsatisfied,

                'satisfactionPercent' =>
                    round(
                        $satisfactionPercent,
                        1
                    )
            ];


            $totalAnswers += $total;

            $totalSatisfied += $satisfied;
        }
    }


    // =========================================================
    // OVERALL
    // =========================================================

    $overallSatisfaction =
        $totalAnswers > 0
        ? (
            $totalSatisfied /
            $totalAnswers
        ) * 100
        : 0;


    // =========================================================
    // JSON
    // =========================================================

    echo json_encode(

        [

            'level' =>
                $level,

            'users' =>
                $users,

            'questions' =>
                $questions,

            'totalAnswers' =>
                $totalAnswers,

            'overallSatisfaction' =>
                round(
                    $overallSatisfaction,
                    1
                )
        ],

        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );
}


function fileSpecial($conn){
$sql = "
    SELECT
        f.tell,
        f.qid,
        f.score,
        q.title,q.groups
    FROM failure_h f
    INNER JOIN questions_h q ON q.qsid = f.qid
    WHERE f.qid > 0
    ORDER BY f.tell, f.qid
";

$result=$conn->QUERY_RUN($conn,$sql);
$data = [];
$questions = [];

while ($row = $result->fetch_assoc()) {

    $tell = $row['tell'];
    $qid = $row['qid'];

    // لیست سوالات
    if (!isset($questions[$qid])) {
        $questions[$qid] = [
            'qid' => $qid,
            'title' => $row['title']. $row['groups'],
            
        ];
    }

    // ایجاد شماره تلفن
    if (!isset($data[$tell])) {
        $data[$tell] = [
            'tell' => $tell
        ];
    }

    // score مربوط به سوال
    $data[$tell][$qid] = $row['score'];
}

echo json_encode([
    'questions' => array_values($questions),
    'data' => array_values($data)
], JSON_UNESCAPED_UNICODE);



}
function fetchPreviousLayer($con){
    $level = (int)$_GET['level'];
    $previousLayer = $level - 1;

    $sql = "
        SELECT
            t1.tell,
            t1.types,
            t1.datetime,
            t1.layer,
            t1.refrence,
            t1.userid
        FROM failure_h t1
        INNER JOIN (
            SELECT tell, MAX(id) AS max_id
            FROM failure_h
            WHERE layer = $previousLayer
              AND tell NOT IN (
                  SELECT tell
                  FROM failure_h
                  WHERE layer = $level
              )
            GROUP BY tell
        ) t2 ON t2.max_id = t1.id
        WHERE t1.layer = $previousLayer
    ";
    $date = new DateTime();
    $date=$date->format('Y-m-d H:i:s');
    if ($result = $con->QUERY_RUN($con, $sql)) {
        $resultArray = array();
        while ($row = $result->fetch_object()) {
	    $date1 = new DateTime();
	    $date2 = new DateTime($row->datetime);
	    $diff = $date1->getTimestamp() - $date2->getTimestamp();
	    $hours = $diff / (3600*24);
            $row->layer=$row->types." (".(int)($hours)." روز پیش)";
	    $row->countdate=(int)($hours);
            $userid = $row->userid;
            $row->userinfo = fetchUserByID($con, $userid);
	    if((int)($hours)>=3)
            $resultArray[] = $row;
        }

usort($resultArray, function ($a, $b) {
    if ($b->countdate == $a->countdate) {
        return 0;
    }

    return ($b->countdate > $a->countdate) ? 1 : -1;
});
        echo json_encode($resultArray);
    }
}


function updateDontRefre($con){
$tell=$_GET['tell'];
$user_id=$_GET['userid'];
$pey_name=$_GET['pey_name'];
$pey_qrcode=$_GET['pey_qrcode'];
$ticket_number=$_GET['ticket_number'];
$ticket_date=$_GET['ticket_date'];
$date = new DateTime();
$date=$date->format('Y-m-d H:i:s');
$id = $con->GET_MAX_COL('failure_h', 'id');
$sql = "INSERT INTO failure_h
(id, userid, tell, score, ratescore,qid,modelresult,types,pey_qrcode,pey_name,refrence,ticket_number,ticket_date,datetime,layer)
VALUES ($id,$user_id,$tell,'',0,0,'','','$pey_qrcode','$pey_name',0,'$ticket_number','$ticket_date','$date',1)";
//echo $sql;
$result=$con->QUERY_RUN($con,$sql);
echo('[{"commited":"1"}]');
}



function fetchQ($con){
$type=$_GET['type'];
$level=$_GET['level'];
if(strcmp($type,'خرابی')==0)
    $sqlAd='';
    else
    $sqlAd="and  type<>'خرابی'";
  $sql = "SELECT  * from questions_h where qsid>0  $sqlAd and level=$level"; //echo $sql;
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
$sql = "update failure_h set 
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
  $sql = "delete  from failure_h where tell='$tell' and datetime='$datetime' and userid='$userid'";
  if ($result=$con->QUERY_RUN($con,$sql)	){
        echo('[{"commited":"1"}]');
  }
}

function fetchMyFailures($con){
$id=$_GET['userid'];
if($id==1)
$sql="
SELECT *
FROM failure_h
JOIN questions_h ON failure_h.qid = questions_h.qsid
where refrence=1
ORDER BY failure_h.id DESC";
else
$sql="
SELECT *
FROM failure_h
JOIN questions_h ON failure_h.qid = questions_h.qsid
WHERE refrence=1
ORDER BY failure_h.id DESC";
//echo $sql; failure_h.userid = $id and 

  if ($result=$con->QUERY_RUN($con,$sql)	){
    $resultArray = array();
   while($row = $result->fetch_object()){
       $userid=$row->userid;
       $row->userinfo=fetchUserByID($con,$userid);
    array_push($resultArray, $row);    
   }
    $t=json_encode($resultArray);
     echo $t;
  } 
}

function fetchDontRefrence($con){
    
$id=$_GET['userid'];
if($id==1)
$sql="
SELECT *
FROM failure_h
where refrence=0
ORDER BY failure_h.id DESC";
else
$sql="
SELECT *
FROM failure_h
WHERE refrence=0
ORDER BY failure_h.id DESC";
  if ($result=$con->QUERY_RUN($con,$sql)	){
    $resultArray = array();
   while($row = $result->fetch_object()){
       $userid=$row->userid;
       $row->userinfo=fetchUserByID($con,$userid);
    array_push($resultArray, $row);    
   }
    $t=json_encode($resultArray);
     echo $t;
  } 
}



function fetchUserByID($con,$userid){
    $sql="SELECT * from user_h where id=$userid";//echo $sql;
  if ($result=$con->QUERY_RUN($con,$sql)	){
    $resultArray = array();
   while($row = $result->fetch_object()){
           array_push($resultArray, $row);    

       
   }
   return $resultArray;
  }
}

function addRowFactor($con){
  $count=$_GET['count'];
  $price=$_GET['price'];
  $title=$_GET['title'];
  $cid=$_GET['cid'];
  $factorrowId=$con->GET_MAX_COL('factorrow','id');
  $result=$con->QUERY_RUN($con,$sql);
  $sql = "insert into factorrow values ($factorrowId,'$title',$price,$count,$cid)"; 
  echo('[{"commited":"1"}]');
}


function submitFailure($con){
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

$data=$_POST['formInput'];
$type=$_GET['type'];
$level=$_GET['level'];
$data = json_decode($data, true); 
foreach ($data as $row) {
$id = $con->GET_MAX_COL('failure_h', 'id');
$date = new DateTime();
$date=$date->format('Y-m-d H:i:s');
    $sql = "INSERT INTO failure_h
    (id, userid, tell, datetime, score,ratescore,qid,types,pey_qrcode,pey_name,refrence,ticket_number,ticket_date,modelresult,layer)
    VALUES (
        $id,
        '{$row['userid']}',
        '{$row['tell']}',
        '$date',
        '{$row['score']}',
        0,
        '{$row['qsid']}',
        '$type',
        '{$row['pey_qrcode']}',
        '{$row['pey_name']}',1,
        '{$row['ticket_number']}',
        '{$row['ticket_date']}',
        '',
        '{$row['level']}'
    )";
  $result=$con->QUERY_RUN($con,$sql);
}
  echo('[{"commited":"1"}]');

}

function login($con){
  $username=$_GET['username'];
  $password=$_GET['password'];
  $sql = "SELECT  id,level,name,family,type,tell,address from user_h where username='$username' and password='$password' ";
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
  