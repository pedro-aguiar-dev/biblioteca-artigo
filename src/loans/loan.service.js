import { AppError } from "../shared/app-error.js";
import { addDays, formatDate, parseDate } from "../shared/date.js";
import { runInTransaction } from "../shared/transaction.js";

const LOAN_DAYS = 14;
const MAX_OPEN_LOANS = 3;

export class LoanService {
  constructor(loanRepository, bookRepository, userRepository) {
    this.loanRepository = loanRepository;
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
  }

  async listLoans() {
    return this.loanRepository.findAll();
  }

  async createLoan(input) {
    const userId = parseId(input?.userId);
    const bookId = parseId(input?.bookId);
    const currentDate = parseDate(input?.currentDate);

    if (userId === null || bookId === null || currentDate === null) {
      throw new AppError("INVALID_LOAN", 400);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("USER_NOT_FOUND", 404);
    }

    const book = await this.bookRepository.findOne({ id: bookId });
    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", 404);
    }

    if (book.availableCopies <= 0) {
      throw new AppError("BOOK_UNAVAILABLE", 409);
    }

    const openLoans = await this.loanRepository.findOpenByUser(userId);
    if (openLoans.length >= MAX_OPEN_LOANS) {
      throw new AppError("LOAN_LIMIT_REACHED", 409);
    }

    const operationDate = formatDate(currentDate);
    if (openLoans.some((loan) => loan.dueDate < operationDate)) {
      throw new AppError("OVERDUE_LOAN", 409);
    }

    const duplicatedBook = await this.loanRepository.findOpenByUserAndBook(
      userId,
      bookId
    );
    if (duplicatedBook) {
      throw new AppError("BOOK_ALREADY_BORROWED", 409);
    }

    const loan = {
      userId,
      bookId,
      loanDate: operationDate,
      dueDate: formatDate(addDays(currentDate, LOAN_DAYS)),
      returnDate: null,
      renewalCount: 0,
    };

    return this.persistLoan(loan, book);
  }

  async returnLoan(input) {
    const loanId = parseId(input?.loanId);
    const currentDate = parseDate(input?.currentDate);

    if (loanId === null || currentDate === null) {
      throw new AppError("INVALID_RETURN", 400);
    }

    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new AppError("LOAN_NOT_FOUND", 404);
    }

    if (loan.returnDate) {
      throw new AppError("LOAN_ALREADY_RETURNED", 409);
    }

    const book = await this.bookRepository.findOne({ id: loan.bookId });
    if (!book) {
      throw new AppError("BOOK_NOT_FOUND", 404);
    }

    return runInTransaction(
      [this.loanRepository, this.bookRepository],
      async () => {
        loan.returnDate = formatDate(currentDate);
        book.availableCopies += 1;
        const returnedLoan = await this.loanRepository.save(loan);
        await this.bookRepository.save(book);
        return returnedLoan;
      }
    );
  }

  async persistLoan(loan, book) {
    return runInTransaction(
      [this.loanRepository, this.bookRepository],
      async () => {
        book.availableCopies -= 1;
        const createdLoan = await this.loanRepository.save(loan);
        await this.bookRepository.save(book);
        return createdLoan;
      }
    );
  }
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
