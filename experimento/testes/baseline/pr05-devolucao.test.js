import test from "node:test";
import assert from "node:assert/strict";
import {
  iniciarServidor,
  livroValido,
  novoServicoDeEmprestimos,
  usuarioValido,
  rejeitaCom,
} from "../apoio.js";

async function preparar({ totalCopies = 3, loanDate = "2026-01-01" } = {}) {
  const ctx = novoServicoDeEmprestimos();
  const user = await ctx.userService.createUser(usuarioValido());
  const book = await ctx.bookService.createBook(livroValido({ totalCopies }));
  const loan = await ctx.loanService.createLoan({ userId: user.id, bookId: book.id, currentDate: loanDate });
  return { ...ctx, user, book, loan };
}

test("RF05 — serviço de devolução", async (t) => {
  await t.test("CT16 / CA22–CA23: registra data e incrementa uma unidade", async () => {
    const { loanService, bookRepository, loan, book } = await preparar();
    const returned = await loanService.returnLoan({ loanId: loan.id, currentDate: "2026-01-05" });
    assert.equal(returned.returnDate, "2026-01-05");
    assert.equal((await bookRepository.findOne({ id: book.id })).availableCopies, 3);
  });

  await t.test("CA24: empréstimo atrasado pode ser devolvido", async () => {
    const { loanService, loan } = await preparar();
    const returned = await loanService.returnLoan({ loanId: loan.id, currentDate: "2026-02-01" });
    assert.equal(returned.returnDate, "2026-02-01");
  });

  await t.test("CT17 / CA25–CA26: segunda devolução é rejeitada sem alterar estoque", async () => {
    const { loanService, bookRepository, loan, book } = await preparar();
    await loanService.returnLoan({ loanId: loan.id, currentDate: "2026-01-05" });
    const before = (await bookRepository.findOne({ id: book.id })).availableCopies;
    await rejeitaCom(loanService.returnLoan({ loanId: loan.id, currentDate: "2026-01-06" }), "LOAN_ALREADY_RETURNED");
    assert.equal((await bookRepository.findOne({ id: book.id })).availableCopies, before);
  });

  await t.test("CA23: devolver um entre vários exemplares incrementa somente uma unidade", async () => {
    const ctx = novoServicoDeEmprestimos();
    const book = await ctx.bookService.createBook(livroValido({ totalCopies: 5 }));
    const loans = [];
    for (let i = 1; i <= 3; i += 1) {
      const user = await ctx.userService.createUser(usuarioValido({ name: `Usuário ${i}`, email: `u${i}@exemplo.com` }));
      loans.push(await ctx.loanService.createLoan({ userId: user.id, bookId: book.id, currentDate: "2026-01-01" }));
    }
    await ctx.loanService.returnLoan({ loanId: loans[0].id, currentDate: "2026-01-05" });
    assert.equal((await ctx.bookRepository.findOne({ id: book.id })).availableCopies, 3);
  });

  await t.test("entrada inválida e empréstimo inexistente são rejeitados", async () => {
    const { loanService } = await preparar();
    await rejeitaCom(loanService.returnLoan({ loanId: 0, currentDate: "2026-01-05" }), "INVALID_RETURN");
    await rejeitaCom(loanService.returnLoan({ loanId: 999, currentDate: "2026-01-05" }), "LOAN_NOT_FOUND");
  });

  await t.test("RN08: falha ao salvar o livro reverte data e estoque", async () => {
    const { loanService, loanRepository, bookRepository, loan, book } = await preparar();
    const originalSave = bookRepository.save.bind(bookRepository);
    bookRepository.save = async () => { throw new Error("falha forçada"); };
    await assert.rejects(loanService.returnLoan({ loanId: loan.id, currentDate: "2026-01-05" }), /falha forçada/);
    bookRepository.save = originalSave;
    assert.equal((await loanRepository.findById(loan.id)).returnDate, null);
    assert.equal((await bookRepository.findOne({ id: book.id })).availableCopies, 2);
  });
});

test("RF05 — API HTTP de devolução", async (t) => {
  const http = await iniciarServidor();
  t.after(() => http.fechar());
  const user = await http.post("/users", usuarioValido());
  const book = await http.post("/books", livroValido());
  const loan = await http.post("/loans", { userId: user.body.id, bookId: book.body.id, currentDate: "2026-01-01" });

  const returned = await http.post(`/loans/${loan.body.id}/return`, { currentDate: "2026-01-20" });
  assert.equal(returned.status, 200);
  assert.equal(returned.body.returnDate, "2026-01-20");

  const duplicate = await http.post(`/loans/${loan.body.id}/return`, { currentDate: "2026-01-21" });
  assert.deepEqual(duplicate, { status: 409, body: { error: "LOAN_ALREADY_RETURNED" } });
});
