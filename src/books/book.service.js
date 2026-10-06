import { AppError } from "../shared/app-error.js";

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

    return this.bookRepository.searchByTitleOrAuthor(term);
  }
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}
