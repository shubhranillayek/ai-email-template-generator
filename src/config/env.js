require("dotenv").config();

// all config comes from .env - the api key is never written in code
const env = {
  port: Number(process.env.PORT) || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
};

module.exports = env;
