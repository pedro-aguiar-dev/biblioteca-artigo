// Ponto único de importação do sistema sob teste (working tree do repositório).
// Os testes rodam contra a versão que estiver no checkout: baseline, experimental ou corrigida.
export { createApp } from "../../src/app.js";
export { AppError } from "../../src/shared/app-error.js";
export { BookRepository } from "../../src/books/book.repository.js";
export { BookService } from "../../src/books/book.service.js";
export { UserRepository } from "../../src/users/user.repository.js";
export { UserService } from "../../src/users/user.service.js";
export { LoanRepository } from "../../src/loans/loan.repository.js";
export { LoanService } from "../../src/loans/loan.service.js";
