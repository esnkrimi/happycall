<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

function chart($conn)
{
    try {

        $layer = $_GET['layer'];

        $sqlUsers = "
            SELECT
                u.id AS userid,

                TRIM(
                    CONCAT(
                        COALESCE(u.name, ''),
                        ' ',
                        COALESCE(u.family, '')
                    )
                ) AS username,

                COUNT(f.id) AS answer_count,

                COUNT(
                    DISTINCT CONCAT(
                        f.tell,
                        '|',
                        f.datetime
                    )
                ) AS call_count

            FROM user_h u

            INNER JOIN failure_h f
                ON f.userid = u.id

            WHERE f.qid > 0
        ";

        if ($layer !== '0') {
            $sqlUsers .= "
                AND f.layer = $layer
            ";
        }

        $sqlUsers .= "
            GROUP BY
                u.id,
                u.name,
                u.family

            ORDER BY
                answer_count DESC
        ";
        //echo $sqlUsers;
        $stmt = $conn->QUERY_RUN($conn, $sqlUsers);

        $users = [];

        if ($stmt) {

            while ($row = $stmt->fetch_assoc()) {

                $users[] = [
                    'userid' => (int) $row['userid'],

                    'username' => trim($row['username']) !== ''
                        ? trim($row['username'])
                        : 'بدون نام',

                    'answer_count' => (int) $row['answer_count'],

                    'call_count' => (int) $row['call_count']
                ];
            }
        }


        /*
         * ============================================================
         * 2 - تحلیل پاسخ هر سؤال
         * ============================================================
         */

        $sqlQuestions = "
            SELECT

                q.qsid AS qid,

                q.title AS title,

                q.groups AS question_group,

                q.level AS question_level,

                q.type AS question_type,

                q.model AS question_model,

                q.ceilspecial,

                f.score,

                COUNT(f.id) AS answer_count

            FROM questions_h q

            INNER JOIN failure_h f
                ON f.qid = q.qsid

            WHERE
                f.qid > 0
                AND TRIM(f.score) <> ''
        ";

        if ($layer !== '0') {

            $sqlQuestions .= "
                AND f.layer = $layer
            ";
        }

        $sqlQuestions .= "
            GROUP BY
                q.qsid,
                q.title,
                q.groups,
                q.level,
                q.type,
                q.model,
                q.ceilspecial,
                f.score

            ORDER BY
                q.qsid ASC
        ";

        $stmt = $conn->QUERY_RUN($conn, $sqlQuestions);

        $questionsMap = [];

        if ($stmt) {

            while ($row = $stmt->fetch_assoc()) {

                $qid = (int) $row['qid'];

                if (!isset($questionsMap[$qid])) {

                    $questionsMap[$qid] = [

                        'qid' => $qid,

                        'title' => trim($row['title']),

                        'group' => trim($row['question_group']),

                        'level' => trim($row['question_level']),

                        'type' => trim($row['question_type']),

                        'model' => trim($row['question_model']),

                        'ceilspecial' => (int) $row['ceilspecial'],

                        'answers' => []
                    ];
                }

                $score = trim($row['score']);

                $questionsMap[$qid]['answers'][] = [

                    'answer' => $score,

                    'count' => (int) $row['answer_count']
                ];
            }
        }


        $questions = array_values($questionsMap);


        /*
         * ============================================================
         * مرتب سازی پاسخ ها
         *
         * عددی:
         * 1
         * 2
         * 3
         *
         * متنی:
         * بر اساس تعداد نزولی
         * ============================================================
         */

        foreach ($questions as &$question) {

            usort(
                $question['answers'],

                function ($a, $b) {

                    $aNum = is_numeric($a['answer']);
                    $bNum = is_numeric($b['answer']);

                    /*
                     * هر دو عدد هستند
                     */
                    if ($aNum && $bNum) {

                        $aValue = (float) $a['answer'];
                        $bValue = (float) $b['answer'];

                        if ($aValue == $bValue) {
                            return 0;
                        }

                        return ($aValue < $bValue) ? -1 : 1;
                    }

                    /*
                     * عدد قبل از متن
                     */
                    if ($aNum && !$bNum) {
                        return -1;
                    }

                    if (!$aNum && $bNum) {
                        return 1;
                    }

                    /*
                     * متن:
                     * تعداد بیشتر اول
                     */
                    if ($a['count'] == $b['count']) {
                        return 0;
                    }

                    return ($a['count'] > $b['count']) ? -1 : 1;
                }
            );
        }

        unset($question);


        /*
         * ============================================================
         * خلاصه آماری
         * ============================================================
         */

        $totalUsers = count($users);

        $totalAnswers = 0;

        $totalCalls = 0;

        foreach ($users as $user) {

            $totalAnswers += $user['answer_count'];

            $totalCalls += $user['call_count'];
        }


        /*
         * ============================================================
         * خروجی JSON
         * ============================================================
         */

        echo json_encode(
            [
                'success' => true,

                'layer' => $layer,

                'summary' => [
                    'users' => $totalUsers,
                    'answers' => $totalAnswers,
                    'calls' => $totalCalls,
                    'questions' => count($questions)
                ],

                'users' => $users,

                'questions' => $questions
            ],

            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        );

    } catch (Throwable $e) {

        http_response_code(500);

        echo json_encode(
            [
                'success' => false,

                'message' => $e->getMessage()
            ],

            JSON_UNESCAPED_UNICODE
        );
    }
}

function fileSpecial($conn)
{
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

    $result = $conn->QUERY_RUN($conn, $sql);
    $data = [];
    $questions = [];

    while ($row = $result->fetch_assoc()) {

        $tell = $row['tell'];
        $qid = $row['qid'];

        // لیست سوالات
        if (!isset($questions[$qid])) {
            $questions[$qid] = [
                'qid' => $qid,
                'title' => $row['title'] . $row['groups'],

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
function fetchPreviousLayer($con)
{
    $level = (int) $_GET['level'];
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
    $date = $date->format('Y-m-d H:i:s');
    if ($result = $con->QUERY_RUN($con, $sql)) {
        $resultArray = array();
        while ($row = $result->fetch_object()) {
            $date1 = new DateTime();
            $date2 = new DateTime($row->datetime);
            $diff = $date1->getTimestamp() - $date2->getTimestamp();
            $hours = $diff / (3600 * 24);
            $row->layer = $row->types . " (" . (int) ($hours) . " روز پیش)";
            $row->countdate = (int) ($hours);
            $userid = $row->userid;
            $row->userinfo = fetchUserByID($con, $userid);
            if ((int) ($hours) >= 3)
                $resultArray[] = $row;
        }

        usort($resultArray, function ($a, $b) {
            if ($a->countdate == $b->countdate) {
                return 0;
            }

            return ($a->countdate < $b->countdate) ? 1 : -1;
        });

        echo json_encode($resultArray);
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
    $date = new DateTime();
    $date = $date->format('Y-m-d H:i:s');
    $id = $con->GET_MAX_COL('failure_h', 'id');
    $sql = "INSERT INTO failure_h
(id, userid, tell, score, ratescore,qid,modelresult,types,pey_qrcode,pey_name,refrence,ticket_number,ticket_date,datetime,layer)
VALUES ($id,$user_id,$tell,'',0,0,'','','$pey_qrcode','$pey_name',0,'$ticket_number','$ticket_date','$date',1)";
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
WHERE refrence=0
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