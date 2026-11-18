<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db-config.php';
$task = $_GET['task'] ?? '';
$stopwords = array("the","and","a","an","of","to","in","that","is","was","for","on","with","as",
  "by","at","from","or","but","if","then","so","because","about","into","through",
  "during","before","after","above","below","up","down","out","off","over","under",
  "again","further","once","here","there","when","where","why","how","all","any",
  "both","each","few","more","most","other","some","such","no","nor","not","only",
  "own","same","than","too","very","can","will","just","don","should","now","i","me",
  "my","we","our","you","your","he","she","it","they","them","his","her","its","their");
$stopwords = array_flip($stopwords);

if ($task == 'corpus') {
    // Select title and lyrics to filter out duplicate song titles
    $sql = "SELECT title, lyrics FROM tracks";
    $result = $conn->query($sql);
    if (!$result) { echo json_encode(["error" => "Query failed"]); exit; }
    $allText = "";
    $processedTitles = array();  // Keep track of processed titles
    while ($row = $result->fetch_assoc()){
      $title = $row["title"];
      // Only process this song if its title hasn't been seen before
      if (!isset($processedTitles[$title])) {
        $allText .= " " . $row["lyrics"];
        $processedTitles[$title] = true;
      }
    }
    $allText = strtolower(preg_replace("/[^a-z0-9\s]/", "", $allText));
    $words = preg_split("/\s+/", $allText);
    $freq = array();
    foreach($words as $word) {
      if (strlen($word) > 2 && !isset($stopwords[$word])) {
        $freq[$word] = isset($freq[$word]) ? $freq[$word] + 1 : 1;
      }
    }
    arsort($freq);
    echo json_encode($freq);
    
} elseif ($task == 'cooccurrence' && isset($_GET['word'])) {
    $selectedWord = strtolower($_GET['word']);
    // Check for an album parameter (for album-specific word associations)
    $album = isset($_GET['album']) ? intval($_GET['album']) : null;
    
    // Modify SQL query to filter by album if album parameter is provided.
    if ($album) {
        $stmt = $conn->prepare("SELECT title, lyrics FROM tracks WHERE album_id = ?");
        $stmt->bind_param("i", $album);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query("SELECT title, lyrics FROM tracks");
    }
    if (!$result) { echo json_encode(["error" => "Query failed"]); exit; }
    $cofreq = array();
    $processedTitles = array();  // To track duplicate songs
    while ($row = $result->fetch_assoc()){
      $title = $row["title"];
      if (isset($processedTitles[$title])) {
          continue;  // Skip duplicate song based on title
      } else {
          $processedTitles[$title] = true;
      }
      $text = strtolower(preg_replace("/[^a-z0-9\s]/", "", $row["lyrics"]));
      $words = preg_split("/\s+/", $text);
      $len = count($words);
      for ($i = 0; $i < $len; $i++){
        if ($words[$i] == $selectedWord) {
          for ($j = max(0, $i-5); $j < min($len, $i+6); $j++){
            if ($j == $i) continue;
            $w = $words[$j];
            if (strlen($w) > 2 && !isset($stopwords[$w])) {
              $cofreq[$w] = isset($cofreq[$w]) ? $cofreq[$w] + 1 : 1;
            }
          }
        }
      }
    }
    arsort($cofreq);
    echo json_encode($cofreq);
} else {
    echo json_encode(["error" => "Invalid task"]);
}
$conn->close();
?>