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
$sql = "SELECT a.id, a.title, GROUP_CONCAT(DISTINCT t.artist SEPARATOR ', ') AS artists
        FROM albums a
        LEFT JOIN tracks t ON a.id = t.album_id
        GROUP BY a.id";
$result = $conn->query($sql);
$albums = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()){
        $artists = $row['artists'];
        if (strpos($artists, ',') !== false) {
            $artists = "Various Artists";
        }
        $albums[] = array(
          "id" => $row['id'],
          "title" => $row['title'],
          "artists" => $artists
        );
    }
}
echo json_encode($albums);
$conn->close();
?>
