<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $datasetId = "d_9aba12b5527843afb0b2e8e4ed6ac6bd";
    $apiKey = "v2:98201480b593f1b433de626f26aeb3a3479ca8d15a84e94d1f19725a190ce45b:bv3sfCtqQ3Jss4y1ASiRaDGec8y1xmdU";

    // First try the original API endpoint - fetch all records (no limit or very high limit)
    $url = "https://data.gov.sg/api/action/datastore_search?resource_id={$datasetId}&limit=10000";

    // Check if cURL is available
    if (!function_exists('curl_init')) {
        throw new Exception('cURL is not available on this server');
    }

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'School-CCA-Finder/1.0');

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        throw new Exception("cURL Error: " . $curl_error);
    }

    if ($http_code !== 200) {
        throw new Exception("HTTP Error: " . $http_code . " - Response: " . $response);
    }

    $data = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON Decode Error: " . json_last_error_msg());
    }

    if (!$data) {
        throw new Exception("Empty response from API");
    }

    // Return the data
    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'debug' => [
            'url' => isset($url) ? $url : 'N/A',
            'http_code' => isset($http_code) ? $http_code : 'N/A',
            'php_version' => phpversion()
        ]
    ]);
}
?>
