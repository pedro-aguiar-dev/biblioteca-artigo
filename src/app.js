import express from "express";
import { AppError } from "./shared/app-error.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(handleError);

  return app;
}

function handleError(error, req, res, next) {
  if (error instanceof AppError) {
    res.status(error.status).json({ error: error.code });
    return;
  }

  if (error.type === "entity.parse.failed") {
    res.status(400).json({ error: "INVALID_JSON" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "INTERNAL_ERROR" });
}
