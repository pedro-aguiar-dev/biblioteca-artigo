import { AppError } from "../shared/app-error.js";

const MAX_SEARCH_RESULTS = 10;

export class BookService {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async createBook(input) {
    const { isbn, title, author, totalCopies } = input;

    if (isBlank(isbn) || isBlank(title) || isBlank(author)) {
      throw new AppError("INVALID_BOOK");
    }

    if (!Number.isInteger(totalCopies) || totalCopies <= 0) {
      throw new AppError("INVALID_QUANTITY");
    }

    const existingBook = await this.bookRepository.findOne({ isbn });

    if (existingBook) {
      throw new AppError("ISBN_ALREADY_EXISTS", 409);
    }

    return this.bookRepository.save({
      isbn,
      title,
      author,
      totalCopies,
      availableCopies: totalCopies,
    });
  }

  async listBooks() {
    return this.bookRepository.findAll();
  }

  async searchBooks(term) {
    if (isBlank(term)) {
      throw new AppError("INVALID_SEARCH_TERM");
    }

    const byTitle = await this.bookRepository.searchByTitle(term);
    const books = byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term);

    return books.slice(0, MAX_SEARCH_RESULTS);
  }
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}
