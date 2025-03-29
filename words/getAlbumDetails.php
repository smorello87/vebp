<?php
header('Content-Type: application/json');
$servername = "xxx";
$username = "xxx";
$password = "xxx";
$dbname = "xxx";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
if (!isset($_GET['id'])) {
    echo json_encode(["error" => "Album id not provided"]);
    exit;
}
$albumId = intval($_GET['id']);
$sql = "SELECT * FROM albums WHERE id = $albumId";
$result = $conn->query($sql);
if (!$result || $result->num_rows == 0) {
    echo json_encode(["error" => "Album not found"]);
    exit;
}
$album = $result->fetch_assoc();
$sql2 = "SELECT title, artist, lyrics FROM tracks WHERE album_id = $albumId";
$result2 = $conn->query($sql2);
$tracks = array();
if ($result2) {
    while($row = $result2->fetch_assoc()){
        $tracks[] = $row;
    }
}
$album['tracks'] = $tracks;
echo json_encode($album);
$conn->close();
?>