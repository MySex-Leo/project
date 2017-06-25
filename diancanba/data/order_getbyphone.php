<?php
header('Content-Type:application/json');

@$phone = $_REQUEST['phone'];
if(empty($phone)){
  echo '[]';
  return;
}

$conn = mysqli_connect('127.0.0.1','root','','diancanba');
$sql = 'SET NAMES UTF8';
mysqli_query($conn,$sql);

$sql = "SELECT dc_order.oid,dc_dish.did,dc_dish.img_sm,dc_order.order_time,dc_order.user_name FROM dc_dish,dc_order WHERE dc_order.did=dc_dish.did AND dc_order.phone='$phone'";

$result = mysqli_query($conn,$sql);
$output = [];

while(true){
  $row = mysqli_fetch_assoc($result);
  if(!$row)
  {
    break;
  }
  $output[] = $row;
}

echo json_encode($output);
?>