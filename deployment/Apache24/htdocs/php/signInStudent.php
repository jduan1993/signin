<?php
$jsonPath = '../data/chen/student.json';
$jsonRecordPath = '../data/chen/record.json';
$json = file_get_contents($jsonPath);
$jsonRecord = file_get_contents($jsonRecordPath);
$arr = json_decode($json);
$arrRecord = empty(json_decode($jsonRecord)) ? array() : json_decode($jsonRecord);

$num = $_POST['num'];
$name = $_POST['name'];
$subject = $_POST['subject'];

for($i=0;$i<count($arr);$i++) {
    if($arr[$i]->key == $num) {
        if($arr[$i]->remaining > 0) {
            $arr[$i]->remaining--;
            $arr[$i]->used++;
        }
    }
}

$newRecord['key'] = empty($arrRecord) ? 0 : $arrRecord[0]->key + 1;
$newRecord['name'] = $name;
$newRecord['subject'] = $subject;
$newRecord['time'] = time();
array_unshift($arrRecord, $newRecord);

$json = json_encode($arr);
$jsonRecord = json_encode($arrRecord);
file_put_contents($jsonPath, $json);
file_put_contents($jsonRecordPath, $jsonRecord);