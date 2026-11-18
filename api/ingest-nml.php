<?php
// Command line only. This script truncates and reloads the albums/tracks tables, so it must never
// be reachable over the web. Run it on the server:  php ingest-nml.php
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Forbidden: this script can only be run from the command line.";
    exit;
}

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

require_once __DIR__ . '/db-config.php';
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
$jsonData = file_get_contents(__DIR__ . "/../data/songs.json");
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
