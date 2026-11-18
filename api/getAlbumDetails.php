<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db-config.php';
if (!isset($_GET['id'])) {
    echo json_encode(["error" => "Album id not provided"]);
    exit;
}
$albumId = intval($_GET['id']);
$stmt = $conn->prepare("SELECT * FROM albums WHERE id = ?");
$stmt->bind_param("i", $albumId);
$stmt->execute();
$result = $stmt->get_result();
if (!$result || $result->num_rows == 0) {
    echo json_encode(["error" => "Album not found"]);
    exit;
}
$album = $result->fetch_assoc();
$stmt2 = $conn->prepare("SELECT title, artist, lyrics FROM tracks WHERE album_id = ?");
$stmt2->bind_param("i", $albumId);
$stmt2->execute();
$result2 = $stmt2->get_result();
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