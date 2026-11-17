// Oráculo PR04-05 — RNF01/RN01: vencimento usa a data controlada da operação.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoServicoDeEmprestimos } from "../../apoio.js";

test("PR04-05: prazo é calculado a partir de currentDate", async () => {
  const c = novoServicoDeEmprestimos();
  const user = await c.userService.createUser({ name: "Ana", email: "ana@exemplo.com" });
  const book = await c.bookService.createBook({ isbn: "alvo", title: "Alvo", author: "Autor", totalCopies: 1 });
  const loan = await c.loanService.createLoan({ userId: user.id, bookId: book.id, currentDate: "2040-01-01" });
  assert.equal(loan.dueDate, "2040-01-15");
});
