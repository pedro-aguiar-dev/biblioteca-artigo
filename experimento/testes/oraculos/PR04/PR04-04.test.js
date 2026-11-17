// Oráculo PR04-04 — RN05/CA20: histórico devolvido do mesmo livro não bloqueia.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoServicoDeEmprestimos } from "../../apoio.js";

test("PR04-04: livro já devolvido pode ser emprestado novamente", async () => {
  const c = novoServicoDeEmprestimos();
  const user = await c.userService.createUser({ name: "Ana", email: "ana@exemplo.com" });
  const book = await c.bookService.createBook({ isbn: "alvo", title: "Alvo", author: "Autor", totalCopies: 1 });
  await c.loanRepository.save({ userId: user.id, bookId: book.id, loanDate: "2026-08-01", dueDate: "2026-08-15", returnDate: "2026-08-10", renewalCount: 0 });
  const loan = await c.loanService.createLoan({ userId: user.id, bookId: book.id, currentDate: "2026-09-22" });
  assert.equal(loan.bookId, book.id);
});
