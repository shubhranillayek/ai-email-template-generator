// tiny logger so every log line has a timestamp
function logInfo(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function logError(message) {
  console.error(`[${new Date().toISOString()}] ${message}`);
}

module.exports = { logInfo, logError };
