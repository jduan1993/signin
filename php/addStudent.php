<?php
$jsonPath = '../data/chen/student.json';
$json = file_get_contents($jsonPath);
$arr = empty(json_decode($json)) ? array() : json_decode($json);

$name = $_POST['name'];
$subject = $_POST['subject'];
$lesson = $_POST['lesson'];

$key = 1;
for($i=0;$i<count($arr);$i++) {
    if($arr[$i]->key > $key) {
        $key = $arr[$i]->key;
    }
    $key += 1;
}

$newStudent['key'] = $key;
$newStudent['name'] = $name;
$newStudent['remaining'] = $lesson;
$newStudent['used'] = 0;
$newStudent['total'] = $lesson;
$newStudent['subject'] = array($subject);

array_push($arr, $newStudent);
$json = json_encode($arr);
file_put_contents($jsonPath, $json);