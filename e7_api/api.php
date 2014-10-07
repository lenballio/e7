<?php
header('Access-Control-Allow-Origin: *');
//header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
//header('Access-Control-Max-Age: 86400');
header('Access-Control-Allow-Headers: Authorization, X-Authorization, Content-Type, X-Requested-With');
//header('Access-Control-Request-Headers: content-type,x-authorization');
//header('Access-Control-Request-Method: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Expose: Location');

$db_host = 'localhost';
$db_username = 'lenny';
$db_pass = 'bigdog21';
$db_name = 'a4062330_xml';

/*
$db_host = 'localhost';
$db_username = 'digilife_e7api';
$db_pass = 'Oa*7$rU5';

$db_name = 'digilife_e7';
*/

$conn = mysql_connect($db_host, $db_username, $db_pass);

if ($conn == false) {
    die('error in db connection');
}

$link = mysql_select_db($db_name);
if ($link == false) {
    die('error in select db');
}

function element($key, $array, $default = NULL) {
    if (isset($array[$key])) {
        return $array[$key];
    } else {
        return $default;
    }
}



$op = element('op', $_GET, NULL);
if ($op === NULL) {
    $op = element('op', $_POST, NULL);
}

$success = false;
$data = array();
$message = "";

if ($op == 'add_item_share') {
    $item_id = element('item_id', $_GET);
    if ($item_id !== NULL) {
        //delete old share records and insert new items
        $sql_delete = "DELETE FROM item_share WHERE item_id = '" . $item_id . "' ";
        $db_delete = mysql_query($sql_delete);
        
        $shared_contents = element('shared_contents', $_GET);
        
        $shared_array = array();
        if ($shared_contents != '') {
            if (is_array($shared_contents)) {
                $shared_array = $shared_contents;
            } else {
                $shared_array = explode(",", $shared_contents);
            }
            
            //insert items into DB
            for ($i = 0, $ni = count($shared_array); $i < $ni; $i++) {
                $sql_insert = "INSERT INTO item_share SET
                               item_id = '" . $item_id . "',
                               shared_content = '" . $shared_array[$i] . "' 
                            ";
                $db_insert = mysql_query($sql_insert);                            
            }
        }
        $success = true;
        $message = "Items added successfully";
    } 
    
} else if ($op == 'get_shared_content') {
    $item_id = element('item_id', $_GET);
    if ($item_id !== NULL) {
        $sql_select = "SELECT item_id, shared_content FROM item_share WHERE item_id = '" . $item_id . "' ";
        $db_select = mysql_query($sql_select);
        
        $data = array();
        while($result = mysql_fetch_assoc($db_select)) {
            $data[] = $result;    
        }
        $success = true;
    }
} else if ($op == 'save_xml') {

    $xml_string = element('xml_data', $_POST); 
    $item_id = element('item_id', $_POST);
    
    $sql_insert = "INSERT INTO item_xml (`item_id`, `xml`) VALUES ('" . $item_id . "', '" . $xml_string . "') 
                    ON DUPLICATE KEY UPDATE xml = '" . $xml_string . "'
    ";
    
    $db_insert = mysql_query($sql_insert);
    if ($db_insert) {
        $success = true;
    }
} else if ($op == 'show_xml') {
    $item_id = element('item_id', $_GET);
    if ($item_id != '') {
        $sql_select = "SELECT xml FROM item_xml WHERE item_id = '" . $item_id . "' ";
        //echo $sql_select;exit;
        $db_select = mysql_query($sql_select);
        
        if (mysql_num_rows($db_select)) {
            $result = mysql_fetch_assoc($db_select);
            $success = true;

            header('Content-Type: text/xml');
            $xml = new SimpleXMLElement($result['xml']);
            echo $xml->asXML();
            exit(0);
        }
    }
}

$return_array = array(
    "success" => $success,
    "data" => $data,
    "message" => $message
);

$data_string = json_encode($return_array);

$callback = '';
if(isset($_GET['callback'])) {
    $callback = $_GET['callback'];
} 

if ($callback) {
    //header('Content-Type: text/javascript');
    echo $callback . '(' . $data_string . ');';
} else {
    //header('Content-Type: application/x-json');
    echo $data_string;
}
exit;