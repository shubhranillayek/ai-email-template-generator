"use strict";

const env = require("../config/env");
const { logInfo, logError } = require("../utils/logger");

const API_HOST = "generativelanguage.googleapis.com";

// Calls Gemini with the prompt and returns the text it gives back.
// Also measures the time the call took (start/end with Date.now) and
// logs it - the brief asks for response time logs.
async function generateText(prompt) {
  if (!env.geminiApiKey) {
    const err = new Error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env and add your key."
    );
    err.statusCode = 500;
    throw err;
  }

  const url = `https://${API_HOST}/v1beta/models/${env.geminiModel}:generateContent`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      // asking for JSON directly, otherwise parsing the reply is a headache
      responseMimeType: "application/json",
      // thinking not needed for such a small task, and it was eating
      // into the output tokens in my tests
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const startTime = Date.now();
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    const responseTimeMs = Date.now() - startTime;
    logError(
      `Gemini API call failed after ${responseTimeMs} ms: ${networkError.message}`
    );
    const err = new Error("Could not reach the Gemini API.");
    err.statusCode = 502;
    throw err;
  }
  const responseTimeMs = Date.now() - startTime;
  logInfo(
    `Gemini API call (model: ${env.geminiModel}) response time: ${responseTimeMs} ms`
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    logError(`Gemini API returned HTTP ${response.status}: ${errorBody}`);
    const err = new Error(
      `Gemini API request failed with status ${response.status}.`
    );
    err.statusCode = 502;
    throw err;
  }

  const body = await response.json();
  const parts =
    body &&
    body.candidates &&
    body.candidates[0] &&
    body.candidates[0].content &&
    body.candidates[0].content.parts;

  if (!parts) {
    const err = new Error("Gemini API returned an unexpected response shape.");
    err.statusCode = 502;
    throw err;
  }

  const text = parts.map((part) => part.text || "").join("").trim();
  return { text, responseTimeMs };
}

module.exports = { generateText };
