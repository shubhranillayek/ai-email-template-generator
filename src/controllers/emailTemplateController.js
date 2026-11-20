"use strict";

const { generateEmailTemplate } = require("../services/emailTemplateService");

// keeping inputs short, this is only for generating small templates
const MAX_FIELD_LENGTH = 200;
const DEFAULT_TONE = "friendly";

// checks the request body and cleans up the values
// returns { value } if ok, { error } if something is wrong
function validateInput(body) {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const purpose = typeof body.purpose === "string" ? body.purpose.trim() : "";
  const recipientName =
    typeof body.recipient_name === "string" ? body.recipient_name.trim() : "";
  const tone =
    typeof body.tone === "string" && body.tone.trim()
      ? body.tone.trim()
      : DEFAULT_TONE;

  if (!purpose) {
    return { error: 'Field "purpose" is required and must be a non-empty string.' };
  }
  if (!recipientName) {
    return {
      error: 'Field "recipient_name" is required and must be a non-empty string.',
    };
  }
  if (
    purpose.length > MAX_FIELD_LENGTH ||
    recipientName.length > MAX_FIELD_LENGTH ||
    tone.length > MAX_FIELD_LENGTH
  ) {
    return {
      error: `Fields "purpose", "recipient_name" and "tone" must be at most ${MAX_FIELD_LENGTH} characters.`,
    };
  }

  return { value: { purpose, recipientName, tone } };
}

// POST /api/email-templates/generate
async function generateEmailTemplateHandler(req, res, next) {
  try {
    const { value, error } = validateInput(req.body);
    if (error) {
      const err = new Error(error);
      err.statusCode = 400;
      throw err;
    }

    const result = await generateEmailTemplate(value);

    res.status(200).json({
      success: true,
      data: {
        subject: result.subject,
        body: result.body,
      },
      meta: {
        model: result.model,
        aiResponseTimeMs: result.aiResponseTimeMs,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateEmailTemplateHandler };
