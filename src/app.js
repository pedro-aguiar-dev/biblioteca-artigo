import express from "express";
import { AppError } from "./shared/app-error.js";
import { BookRepository } from "./books/book.repository.js";
import { BookService } from "./books/book.service.js";
import { createBookRouter } from "./books/book.routes.js";
import { UserRepository } from "./users/user.repository.js";
import { UserService } from "./users/user.service.js";
import { createUserRouter } from "./users/user.routes.js";

export function createApp() {
  const bookRepository = new BookRepository();
  const bookService = new BookService(bookRepository);
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);

  const app = express();

  app.use(express.json());

  app.use("/books", createBookRouter(bookService));
  app.use("/users", createUserRouter(userService));

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
