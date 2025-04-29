<?php
$jsonPath = '../data/chen/student.json';
$json = file_get_contents($jsonPath);
$arr = json_decode($json);

$num = $_POST['num'];
$name = $_POST['name'];
$subject = $_POST['subject'];
$remaining = $_POST['remaining'];
$used = $_POST['used'];
$total = $_POST['total'];

for($i=0;$i<count($arr);$i++) {
    if($arr[$i]->key == $num) {
        $arr[$i]->name = $name;
        $arr[$i]->subject = [$subject];
        $arr[$i]->remaining = $remaining;
        $arr[$i]->used = $used;
        $arr[$i]->total = $total;
    }
}

$json = json_encode($arr);
file_put_contents($jsonPath, $json);