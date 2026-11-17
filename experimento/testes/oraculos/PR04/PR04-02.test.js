// Oráculo PR04-02 — RN04/CA19: somente empréstimos abertos contam para o limite.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoServicoDeEmprestimos } from "../../apoio.js";

test("PR04-02: histórico devolvido não bloqueia novo empréstimo", async () => {
  const c = novoServicoDeEmprestimos();
  const user = await c.userService.createUser({ name: "Ana", email: "ana@exemplo.com" });
  const book = await c.bookService.createBook({ isbn: "alvo", title: "Alvo", author: "Autor", totalCopies: 1 });
  for (let i = 1; i <= 3; i++) {
    await c.loanRepository.save({ userId: user.id, bookId: 100 + i, loanDate: "2026-08-01", dueDate: "2026-08-15", returnDate: "2026-08-10", renewalCount: 0 });
  }
  const loan = await c.loanService.createLoan({ userId: user.id, bookId: book.id, currentDate: "2026-09-22" });
  assert.equal(loan.bookId, book.id);
});
