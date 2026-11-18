<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db-config.php';
$sql = "SELECT t.title AS track_title, t.artist, t.lyrics, a.title AS album_title
        FROM tracks t
        LEFT JOIN albums a ON t.album_id = a.id";
$result = $conn->query($sql);
$tracks = array();
$processedTitles = array(); // Array to track processed song titles

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()){
        $trackTitle = $row["track_title"];
        // Skip this track if its title has already been processed
        if (isset($processedTitles[$trackTitle])) {
            continue;
        }
        $processedTitles[$trackTitle] = true;
        $tracks[] = array(
            "album"  => $row["album_title"],
            "title"  => $trackTitle,
            "lyrics" => $row["lyrics"]
        );
    }
}
echo json_encode($tracks);
$conn->close();
?>