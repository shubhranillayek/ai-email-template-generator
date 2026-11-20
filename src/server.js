const app = require("./app");
const env = require("./config/env");
const { logInfo, logError } = require("./utils/logger");

app.listen(env.port, () => {
  logInfo(`Server running on port ${env.port}`);
  if (!env.geminiApiKey) {
    // server still starts, but the generate endpoint will throw a 500
    logError("GEMINI_API_KEY is not set in .env - generate requests will fail");
  }
});
