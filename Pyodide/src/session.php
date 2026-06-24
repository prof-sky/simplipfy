<?php

$host = 'localhost';
$dbname = getenv('DB_NAME');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');
$sessionLimit = getenv('SESSION_LIMIT');
$entryLimit = getenv('ENTRY_LIMIT');

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    returnCodeAndJson(500, "Error while conecting to the DB: " . $e->getMessage(), 4);
    exit;
}

function createEventsTable($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            event TEXT NOT NULL,
            timestamp INT NOT NULL
        )
    ");
}

function createValidSessionIdsTable($db) {
    $db->exec("
        CREATE TABLE IF NOT EXISTS valid_session_ids (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            remove_key VARCHAR(255) NOT NULL
        )
    ");
}

createEventsTable($db);
createValidSessionIdsTable($db);

// ============================== Actions ==============================
$action = $_GET['action'] ?? $_POST['action'] ?? null;

// Add sessionId to valid ids -> activates tracking
if ($action === 'addSessionId') {
    $sessionId = $_GET['sessionId'] ?? $_POST['sessionId'] ?? null;
    $removeKey = $_GET['removeKey'] ?? $_POST['removeKey'] ?? null;

    if (!$sessionId || !$removeKey) {
        returnCodeAndJson(400, "Missing sessionId or removeKey", 8);
        exit;
    }

    $checkLimit = $db->prepare("SELECT COUNT(*) FROM valid_session_ids");
    $checkLimit->execute();
    $inLimit = (int)$checkLimit->fetchColumn() < (int)$sessionLimit;

    if (!$inLimit) {
        returnCodeAndJson(403, "Session limit exceeded, limit is: $sessionLimit", 3);
        exit;
    }

    $stmt = $db->prepare("SELECT EXISTS(SELECT 1 FROM valid_session_ids WHERE session_id = ?)");
    $stmt->execute([$sessionId]);

    $exists = (bool)$stmt->fetchColumn();
    if (!$exists){
        $stmt = $db->prepare("INSERT INTO valid_session_ids (session_id, remove_key) VALUES (?, ?)");
        $stmt->execute([$sessionId, $removeKey]);
        returnCodeAndJson(200, "OK, session_id: $sessionId, is active now", 0);
        exit;
    }
    else {
        returnCodeAndJson(405, "Tracking already active", 7);
        exit;
    }
}

// Remove sessionId from valid ids -> deactivates tracking
if ($action === 'deleteSessionId') {
    $sessionId = $_GET['sessionId'] ?? $_POST['sessionId'] ?? null;
    $removeKey = $_GET['removeKey'] ?? $_POST['removeKey'] ?? null;
    $apiSecret = $_GET['secret'] ?? $_POST['secret'] ?? null;

    $stmtRemoveKey = $db->prepare("SELECT remove_key FROM valid_session_ids WHERE session_id = ?");
    $stmtRemoveKey->execute([$sessionId]);
    $row = $stmtRemoveKey->fetch(PDO::FETCH_ASSOC);

    if($row){   
        $savedRemoveKey = $row["remove_key"];
    }
    else {
        returnCodeAndJson(403, "Invalid Session ID", 6);
        exit;
    }

    if ($savedRemoveKey !== $removeKey) {
        returnCodeAndJson(403, "Validation failed", 5);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM valid_session_ids WHERE session_id = :session_id");
    $stmt->bindParam(':session_id', $sessionId, PDO::PARAM_STR);
    $stmt->execute();

    clear($db, $sessionId);

    returnCodeAndJson(200, "OK (deleted session_id: $sessionId)", false);
    exit;
}

if ($action === 'send') {
    $sessionId = $_POST['sessionId'] ?? '';
    $name = $_POST['name'] ?? '';
    $event = $_POST['event'] ?? '';
    $time = time();

    $check = $db->prepare("SELECT COUNT(*) FROM valid_session_ids WHERE session_id = ?");
    $check->execute([$sessionId]);
    $valid = $check->fetchColumn() > 0;

    if (!$valid) {
        returnCodeAndJson(403, "Invalid session ID", 6);
        exit;
    }

    $checkLimit = $db->prepare("SELECT COUNT(*) FROM events WHERE session_id = :session_id");
    $checkLimit->bindParam(':session_id', $sessionId, PDO::PARAM_STR);
    $checkLimit->execute();
    $inLimit = (int)$checkLimit->fetchColumn() < (int)$entryLimit;

    if (!$inLimit) {
        returnCodeAndJson(405, "Entry limit exceeded", 2);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO events (session_id, name, event, timestamp) VALUES (?, ?, ?, ?)");
    $stmt->execute([$sessionId, $name, $event, $time]);

    returnCodeAndJson(200, "Event received and saved", 0);
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
    $stmt = $db->query("SELECT session_id FROM valid_session_ids");
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
    exit;
}

// ============================== Helpers ==============================
function exitIfWrongSecret(): void {
    $isCorrect = checkApiSecret();

    if (!$isCorrect) {
        returnCodeAndJson(403, "Error: invalid secret", 5);
        exit;
    }
}


function checkApiSecret(): bool {
    $userKey = $_GET['secret'] ?? $_POST['secret'] ?? '';
    $secretKey = getenv('API_SECRET');

    if ($userKey !== $secretKey) {
        return false;
    }

    return true;
}

/**
 * Summary of returnCodeAndJson
 * @param int $code http return code
 * @param int $errorCode error code from .../inskale/Pyodide/src/pages/tools/liveTracker.js, 0 represents no error
 * @param string $message error message
 * @return void
 */
function returnCodeAndJson(int $code, string $message = "", int $errorCode = 0): void {
    http_response_code($code);    

    header('Content-Type: application/json');

    echo json_encode([
        "errorCode" => $errorCode,
        "message" => $message,
    ]);
}

// Debug
if ($action === "debugSessionIds") {
    exitIfWrongSecret();
    $stmt = $db->query("SELECT * FROM valid_session_ids ORDER BY id ASC");
    echo "<pre>";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo "</pre>";
    exit;
}

// Debug
if ($action === 'debugEvents') {
    exitIfWrongSecret();
    $stmt = $db->query("SELECT * FROM events ORDER BY id ASC");
    echo "<pre>";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo "</pre>";
    exit;
}

function clear(PDO $db, string $sessionId): void {
    $stmt = $db->prepare("DELETE FROM events WHERE session_id = :session_id");
    $stmt->bindParam(':session_id', $sessionId, PDO::PARAM_STR);
    $stmt->execute();
}

// Clear DB
if ($action === 'clear') {
    $sessionId = $_GET['sessionId'] ?? $_POST['sessionId'] ?? null;    
    clear($db, $sessionId);
    
    returnCodeAndJson(200,"OK (deleted session_id: $sessionId)", 0);
    exit;
}

// Clear complete DB
if ($action === 'clearAll') {
    exitIfWrongSecret();
    // Delete events
    $stmt = $db->prepare("DELETE FROM events");
    $stmt->execute();
    // Delete valid session ids
    $stmt = $db->prepare("DELETE FROM valid_session_ids");
    $stmt->execute();
    returnCodeAndJson(200, "OK (deleted all)", 0);
    exit;
}

if ($action === 'debugVariables') {
    exitIfWrongSecret();
    echo "<pre>";
    echo "host: " . $host . "\n";
    echo "DB_NAME: " . getenv('DB_NAME') . "\n";
    echo "DB_USER: " . getenv('DB_USER') . "\n";
    echo "DB_PASSWORD: " . getenv('DB_PASSWORD') . "\n";
    echo "SESSION_LIMIT: " . getenv('SESSION_LIMIT') . "\n";
    echo "ENTRY_LIMIT: " . getenv('ENTRY_LIMIT') . "\n";
    echo "</pre>";
    exit;
}

if ($action === 'recreateTables') {
    exitIfWrongSecret();
    $db->exec("DROP TABLE IF EXISTS events");
    $db->exec("DROP TABLE IF EXISTS valid_session_ids");

    createValidSessionIdsTable($db);
    createEventsTable($db);

    returnCodeAndJson(200, "OK (recreated tables)", 0);
    exit;
}
?>
