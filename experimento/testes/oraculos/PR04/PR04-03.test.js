// Oráculo PR04-03 — RN07: vencimento igual à data da operação ainda não é atraso.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoServicoDeEmprestimos } from "../../apoio.js";

test("PR04-03: empréstimo que vence hoje não bloqueia um novo", async () => {
  const c = novoServicoDeEmprestimos();
  const user = await c.userService.createUser({ name: "Ana", email: "ana@exemplo.com" });
  const book = await c.bookService.createBook({ isbn: "alvo", title: "Alvo", author: "Autor", totalCopies: 1 });
  await c.loanRepository.save({ userId: user.id, bookId: 999, loanDate: "2026-09-08", dueDate: "2026-09-22", returnDate: null, renewalCount: 0 });
  const loan = await c.loanService.createLoan({ userId: user.id, bookId: book.id, currentDate: "2026-09-22" });
  assert.equal(loan.bookId, book.id);
});
