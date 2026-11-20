"use strict";

const express = require("express");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

// simple health check, handy to confirm the server is up
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/email-templates", emailTemplateRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
