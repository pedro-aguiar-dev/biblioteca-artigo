import { Router } from "express";

export function createBookRouter(bookService) {
  const router = Router();

  router.post("/", async (req, res) => {
    const book = await bookService.createBook(req.body ?? {});
    res.status(201).json(book);
  });

  router.get("/", async (req, res) => {
    const books = await bookService.listBooks();
    res.json(books);
  });

  router.get("/search", async (req, res) => {
    const books = await bookService.searchBooks(req.query.q);
    res.json(books);
  });

  return router;
}
