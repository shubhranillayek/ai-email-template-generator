"use strict";

const { generateText } = require("./geminiService");
const env = require("../config/env");

// Builds the prompt for Gemini. The main things I had to be careful about:
// the reply must come back as only JSON (so I can parse it), and the model
// should not make up details like prices or dates - placeholders are fine.
function buildPrompt({ purpose, recipientName, tone }) {
  return [
    "You are an experienced email copywriter who writes short, clear,",
    "customer-friendly emails for a business.",
    "",
    "Write one email template using exactly these inputs:",
    `- Purpose of the email: ${purpose}`,
    `- Recipient's name: ${recipientName}`,
    `- Tone to write in: ${tone}`,
    "",
    "Rules:",
    "- Address the recipient by name in the greeting.",
    "- Keep the body short: 2 short paragraphs plus a one-line sign-off.",
    "- Match the requested tone throughout.",
    "- Do not invent facts: no prices, dates, discounts, links or names",
    "  that were not given. Where a detail is missing, use a simple",
    "  placeholder such as [Company Name] or [Your Name].",
    "- Write a clear subject line that matches the purpose.",
    "",
    'Return ONLY a JSON object in this exact shape:',
    '{ "subject": "<subject line>", "body": "<full email body>" }',
    "In the body, separate paragraphs with \\n\\n. No markdown, no extra keys,",
    "no text outside the JSON object.",
  ].join("\n");
}

// the model sometimes still sends something unusable, so check both fields
function parseTemplate(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (parseError) {
    const err = new Error("AI model did not return valid JSON.");
    err.statusCode = 502;
    throw err;
  }

  if (
    !parsed ||
    typeof parsed.subject !== "string" ||
    typeof parsed.body !== "string" ||
    !parsed.subject.trim() ||
    !parsed.body.trim()
  ) {
    const err = new Error("AI model returned an incomplete email template.");
    err.statusCode = 502;
    throw err;
  }

  return { subject: parsed.subject.trim(), body: parsed.body.trim() };
}

async function generateEmailTemplate(input) {
  const prompt = buildPrompt(input);
  const { text, responseTimeMs } = await generateText(prompt);
  const template = parseTemplate(text);

  return {
    ...template,
    aiResponseTimeMs: responseTimeMs,
    model: env.geminiModel,
  };
}

module.exports = { generateEmailTemplate, buildPrompt };
