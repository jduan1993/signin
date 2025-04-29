<?php
$jsonPath = '../data/chen/student.json';
$json = file_get_contents($jsonPath);
$arr = json_decode($json);

if(!empty($_POST)){
    $key = $_POST['key'];

    for($i=count($arr)-1;$i>-1;$i--) {
        if(in_array($arr[$i]->key, $key)) {
            array_splice($arr, $i, 1);
        }
    }

    $json = json_encode($arr);
    echo $json;
    file_put_contents($jsonPath, $json);
}