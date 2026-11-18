<?php
/**
 * Database connection for the "Words" API (api.php, getAlbums.php, getAlbumDetails.php,
 * getAllTracks.php, ingest-nml.php).
 *
 * Copy this file to db-config.php (which is git-ignored) and fill in your own MySQL/MariaDB details.
 * The database needs the `albums` and `tracks` tables; run `php ingest-nml.php` from the command line
 * to load data/songs.json into them.
 */
mysqli_report(MYSQLI_REPORT_OFF);

$servername = "localhost";
$username   = "xxx";
$password   = "xxx";
$dbname     = "xxx";

$conn = @new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    error_log("VEBP API: DB connection failed: " . $conn->connect_error);
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode(["error" => "Database connection failed"]));
}
$conn->set_charset('utf8mb4');
