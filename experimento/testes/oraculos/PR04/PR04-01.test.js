// Oráculo PR04-01 — RN08/CA21: rejeição por limite não altera a disponibilidade.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoServicoDeEmprestimos, rejeitaCom } from "../../apoio.js";

test("PR04-01: quarto empréstimo rejeitado preserva o estoque", async () => {
  const c = novoServicoDeEmprestimos();
  const user = await c.userService.createUser({ name: "Ana", email: "ana@exemplo.com" });
  const book = await c.bookService.createBook({ isbn: "alvo", title: "Alvo", author: "Autor", totalCopies: 2 });
  for (let i = 1; i <= 3; i++) {
    await c.loanRepository.save({ userId: user.id, bookId: 100 + i, loanDate: "2026-09-01", dueDate: "2026-10-01", returnDate: null, renewalCount: 0 });
  }
  await rejeitaCom(c.loanService.createLoan({ userId: user.id, bookId: book.id, currentDate: "2026-09-22" }), "LOAN_LIMIT_REACHED");
  assert.equal((await c.bookService.listBooks())[0].availableCopies, 2);
});
