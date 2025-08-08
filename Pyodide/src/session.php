<?php

$host = 'localhost';
$dbname = getenv('DB_NAME');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo "Fehler bei der DB-Verbindung: " . $e->getMessage();
    exit;
}

$db->exec("
    CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        event TEXT NOT NULL,
        timestamp INT NOT NULL
    )
");
$db->exec("
    CREATE TABLE IF NOT EXISTS valid_session_ids (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL
    )
");

// ============================== Actions ==============================
$action = $_GET['action'] ?? $_POST['action'] ?? null;

// Add sessionId to valid ids
if ($action === 'addSessionId') {
    $sessionId = $_GET['sessionId'] ?? $_POST['sessionId'] ?? null;
    $stmt = $db->prepare("INSERT IGNORE INTO valid_session_ids (session_id) VALUES (?)");
    $stmt->execute([$sessionId]);
    echo "OK (inserted session_id: $sessionId)";
    exit;
}

// Remove sessionId from valid ids
if ($action === 'deleteSessionId') {
    $sessionId = $_GET['sessionId'] ?? $_POST['sessionId'] ?? null;
    $stmt = $db->prepare("DELETE FROM valid_session_ids WHERE session_id = :session_id");
    $stmt->bindParam(':session_id', $sessionId, PDO::PARAM_STR);
    $stmt->execute();
    echo "OK (deleted session_id: $sessionId)";
    exit;
}

if ($action === 'send') {
    $session = $_POST['sessionId'] ?? '';
    $name = $_POST['name'] ?? '';
    $event = $_POST['event'] ?? '';
    $time = time();

    $check = $db->prepare("SELECT COUNT(*) FROM valid_session_ids WHERE session_id = ?");
    $check->execute([$session]);
    $valid = $check->fetchColumn() > 0;

    if (!$valid) {
        http_response_code(403);
        echo "Error: invalid sessionId.";
        exit;
    }

    $stmt = $db->prepare("INSERT INTO events (session_id, name, event, timestamp) VALUES (?, ?, ?, ?)");
    $stmt->execute([$session, $name, $event, $time]);

    echo "OK";
    exit;
}

if ($action === 'read') {
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    $session = $_GET['sessionId'] ?? '';
    $lastId = intval($_GET['lastId'] ?? 0);
    $stmt = $db->prepare("SELECT * FROM events WHERE session_id = ? AND id > ? ORDER BY id ASC");
    $stmt->execute([$session, $lastId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($action === 'sessions') {
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    $stmt = $db->query("SELECT DISTINCT session_id FROM events");
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
    exit;
}

// ============================== Helpers ==============================

function checkApiSecret(): void {
    $userKey = $_GET['secret'] ?? $_POST['secret'] ?? '';
    $secretKey = getenv('API_SECRET');

    if ($userKey !== $secretKey) {
        http_response_code(403);
        echo "Error: invalid secret.";
        exit;
    }
}

// Debug
if ($action === "debugSessionIds") {
    checkApiSecret();
    $stmt = $db->query("SELECT * FROM valid_session_ids ORDER BY id ASC");
    echo "<pre>";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo "</pre>";
    exit;
}

// Debug
if ($action === 'debug') {
    checkApiSecret();
    $stmt = $db->query("SELECT * FROM events ORDER BY id ASC");
    echo "<pre>";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo "</pre>";
    exit;
}

// Clear DB
if ($action === 'clear') {
    $sessionId = $_GET['sessionId'] ?? $_POST['sessionId'] ?? null;
    $stmt = $db->prepare("DELETE FROM events WHERE session_id = :session_id");
    $stmt->bindParam(':session_id', $sessionId, PDO::PARAM_STR);
    $stmt->execute();
    echo "OK (deleted session_id: $sessionId)";
    exit;
}

// Clear complete DB
if ($action === 'clearAll') {
    checkApiSecret();
    // Delete events
    $stmt = $db->prepare("DELETE FROM events");
    $stmt->execute();
    // Delete valid session ids
    $stmt = $db->prepare("DELETE FROM valid_session_ids");
    $stmt->execute();
    echo "OK (deleted all)";
    exit;
}

?>
