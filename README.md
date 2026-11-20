# Email Template Generator

A small API I built for the INT. (Indus Net Technologies) First Flush
assignment (Assignment 2). You send it the purpose of an email, the
recipient's name and a tone, and it uses the Gemini AI model to write a
short email template - a subject line and the body text.

Stack: Node.js, Express, Google Gemini API.

## How to run it

You need Node.js 18 or above and a Gemini API key (free from
[Google AI Studio](https://aistudio.google.com/apikey)).

```bash
npm install
cp .env.example .env
```

Open `.env` and put your key in it:

```
GEMINI_API_KEY=your key here
GEMINI_MODEL=gemini-3.5-flash   # optional, this is the default
PORT=3000                        # optional
```

Then start the server:

```bash
npm start
```

It runs on http://localhost:3000. The key is only read from `.env`, and
`.env` is in `.gitignore`, so it never goes to GitHub.

## The API

There is one main endpoint:

```
POST /api/email-templates/generate
```

Send JSON like this:

```bash
curl -X POST http://localhost:3000/api/email-templates/generate \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "welcome email for a new subscriber",
    "recipient_name": "Priya",
    "tone": "friendly"
  }'
```

- `purpose` - what the email is for (required)
- `recipient_name` - the name used in the greeting (required)
- `tone` - friendly, formal, apologetic, etc. If you skip it, friendly
  is used.

Response (this is from an actual run on my machine, only the time taken
changes every call):

```json
{
  "success": true,
  "data": {
    "subject": "Welcome to [Company Name]!",
    "body": "Hi Priya,\n\nWelcome to our community! We are so excited to have you with us and look forward to sharing our latest updates and stories directly to your inbox.\n\nOur goal is to bring you helpful content that you will love. If you ever have any questions or feedback, please feel free to reply to this email anytime.\n\nBest regards,\n[Your Name]"
  },
  "meta": {
    "model": "gemini-3.5-flash",
    "aiResponseTimeMs": 11535
  }
}
```

There is also a health check: `GET /health` returns
`{ "status": "ok", ... }`.

If something is wrong with the request, you get the same kind of JSON
back with an error message, for example a missing field gives HTTP 400:

```json
{ "success": false, "error": "Field \"recipient_name\" is required and must be a non-empty string." }
```

If Gemini itself fails or cannot be reached it is HTTP 502, and if the
API key is missing in `.env` it is HTTP 500.

## Response time logging

The brief asked for response time logs, so every call to Gemini is timed
with `Date.now()` - once just before the request goes out and once when
the reply comes back. The difference is printed in the server log and
also sent back in the response as `meta.aiResponseTimeMs`.

Log line looks like this:

```
[2026-11-20T10:56:38.615Z] Gemini API call (model: gemini-3.5-flash) response time: 11535 ms
```

## A short note on the prompt

The prompt is built in `src/services/emailTemplateService.js`. The main
points I kept in mind while writing it:

- The model is told to act as an email copywriter, otherwise it starts
  explaining things instead of just writing the email.
- Purpose, name and tone go in as separate labelled lines.
- It is told not to invent details - no fake prices, dates or links.
  If something is missing it should use a placeholder like
  `[Company Name]`, because this is a template people will reuse.
- It must reply with only a JSON object `{ "subject": ..., "body": ... }`.
  I also set `responseMimeType: "application/json"` in the Gemini call,
  so the reply is easy to parse. In the same call I set the thinking
  budget to 0 - for a small drafting task it is not needed, and in my
  testing it was eating into the output tokens.

## Project files

```
src/
  server.js          starts the server
  app.js             express app and /health
  config/env.js      reads the .env values
  routes/            the /generate route
  controllers/       checks the input, sends the response
  services/          prompt + parsing, and the Gemini call
  middleware/        error handling
  utils/logger.js    log lines with timestamps
```

## One problem I saw while testing

Sometimes Gemini returns HTTP 503 when it is busy. My API passes that on
as HTTP 502. Waiting a few seconds and sending the request again worked
every time I tried.
