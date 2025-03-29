<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ingest.php
$servername = "xxx";
$username = "xxx";
$password = "xxx";
$dbname = "xxx";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset('utf8mb4');  // Set the character set to utf8mb4
/**
 * Clears all data from the albums and tracks tables only.
 */
function clearDatabase($conn) {
    // Disable foreign key checks to avoid errors while truncating tables
    $conn->query("SET FOREIGN_KEY_CHECKS = 0");

    // Truncate only the albums and tracks tables
    $conn->query("TRUNCATE TABLE `albums`");
    $conn->query("TRUNCATE TABLE `tracks`");

    // Re-enable foreign key checks
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");
}

// Clear specific tables before loading the new JSON data
clearDatabase($conn);

// Read the JSON file
$jsonData = file_get_contents("songs.json");
$data = json_decode($jsonData, true);

foreach($data as $albumKey => $album) {
    $title = $conn->real_escape_string($album["title"]);
    $year = intval($album["year"]);
    $sql = "INSERT INTO albums (title, year) VALUES ('$title', $year)";
    if ($conn->query($sql) === TRUE) {
        $albumId = $conn->insert_id;
        foreach($album["tracks"] as $trackName => $trackData) {
            $trackTitle = $conn->real_escape_string($trackName);
            $artist = $conn->real_escape_string($trackData["artist"]);
            $lyrics = $conn->real_escape_string($trackData["lyrics"]);
            $sql2 = "INSERT INTO tracks (album_id, title, artist, lyrics)
                     VALUES ($albumId, '$trackTitle', '$artist', '$lyrics')";
            $conn->query($sql2);
        }
    }
}

echo "Ingestion complete.";
$conn->close();
?>
