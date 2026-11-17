// Baseline do PR04 — RF04 Realizar empréstimo (CA14–CA21; CT10–CT15 da ESP).
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  iniciarServidor,
  novoServicoDeEmprestimos,
  rejeitaCom,
} from "../apoio.js";

const HOJE = "2026-09-22";

async function preparar() {
  const contexto = novoServicoDeEmprestimos();
  const user = await contexto.userService.createUser({
    name: "Ana Souza",
    email: "ana@exemplo.com",
  });
  const book = await contexto.bookService.createBook({
    isbn: "ISBN-1",
    title: "Clean Code",
    author: "Robert Martin",
    totalCopies: 2,
  });
  return { ...contexto, user, book };
}

function entrada(userId, bookId, currentDate = HOJE) {
  return { userId, bookId, currentDate };
}

function emprestimoAberto(userId, bookId, campos = {}) {
  return {
    userId,
    bookId,
    loanDate: "2026-09-01",
    dueDate: "2026-09-15",
    returnDate: null,
    renewalCount: 0,
    ...campos,
  };
}

describe("RF04 — serviço de empréstimos", () => {
  test("CT10 / CA14–CA16: cria empréstimo de 14 dias e reduz uma unidade", async () => {
    const { loanService, bookService, user, book } = await preparar();

    const loan = await loanService.createLoan(entrada(user.id, book.id));

    assert.deepEqual(loan, {
      userId: user.id,
      bookId: book.id,
      loanDate: HOJE,
      dueDate: "2026-10-06",
      returnDate: null,
      renewalCount: 0,
      id: 1,
    });
    assert.equal((await bookService.listBooks())[0].availableCopies, 1);
  });

  test("CA15: cálculo de 14 dias atravessa mês e ano corretamente", async () => {
    const { loanService, user, book } = await preparar();
    const loan = await loanService.createLoan(entrada(user.id, book.id, "2026-12-25"));
    assert.equal(loan.dueDate, "2027-01-08");
  });

  test("CT11 / CA14 e CA21: usuário inexistente é rejeitado sem alterar estoque", async () => {
    const { loanService, bookService, book } = await preparar();
    await rejeitaCom(loanService.createLoan(entrada(999, book.id)), "USER_NOT_FOUND");
    assert.equal((await bookService.listBooks())[0].availableCopies, 2);
  });

  test("CT11 / CA14 e CA21: livro inexistente é rejeitado sem criar empréstimo", async () => {
    const { loanService, loanRepository, user } = await preparar();
    await rejeitaCom(loanService.createLoan(entrada(user.id, 999)), "BOOK_NOT_FOUND");
    assert.deepEqual(await loanRepository.findAll(), []);
  });

  test("CT12 / CA17 e CA21: livro indisponível é rejeitado sem alterar estado", async () => {
    const { loanService, bookService, loanRepository, user, book } = await preparar();
    book.availableCopies = 0;
    await rejeitaCom(loanService.createLoan(entrada(user.id, book.id)), "BOOK_UNAVAILABLE");
    assert.equal((await bookService.listBooks())[0].availableCopies, 0);
    assert.deepEqual(await loanRepository.findAll(), []);
  });

  test("CT13 / CA18 e RN07: empréstimo anterior à operação bloqueia e preserva estoque", async () => {
    const { loanService, loanRepository, bookService, user, book } = await preparar();
    await loanRepository.save(emprestimoAberto(user.id, 99));
    await rejeitaCom(loanService.createLoan(entrada(user.id, book.id)), "OVERDUE_LOAN");
    assert.equal((await bookService.listBooks())[0].availableCopies, 2);
  });

  test("RN07: empréstimo que vence hoje ainda não está atrasado", async () => {
    const { loanService, loanRepository, user, book } = await preparar();
    await loanRepository.save(emprestimoAberto(user.id, 99, { dueDate: HOJE }));
    const loan = await loanService.createLoan(entrada(user.id, book.id));
    assert.equal(loan.bookId, book.id);
  });

  test("RN07: empréstimo com vencimento futuro não bloqueia", async () => {
    const { loanService, loanRepository, user, book } = await preparar();
    await loanRepository.save(emprestimoAberto(user.id, 99, { dueDate: "2026-09-23" }));
    assert.equal((await loanService.createLoan(entrada(user.id, book.id))).bookId, book.id);
  });

  test("CT14 / CA19 e CA21: três empréstimos abertos bloqueiam o quarto", async () => {
    const { loanService, loanRepository, bookService, user, book } = await preparar();
    for (let i = 1; i <= 3; i++) {
      await loanRepository.save(emprestimoAberto(user.id, 100 + i, { dueDate: "2026-10-01" }));
    }
    await rejeitaCom(loanService.createLoan(entrada(user.id, book.id)), "LOAN_LIMIT_REACHED");
    assert.equal((await bookService.listBooks())[0].availableCopies, 2);
  });

  test("CA19: empréstimos devolvidos não contam para o limite de três abertos", async () => {
    const { loanService, loanRepository, user, book } = await preparar();
    for (let i = 1; i <= 5; i++) {
      await loanRepository.save(
        emprestimoAberto(user.id, 100 + i, { returnDate: "2026-09-10" })
      );
    }
    assert.equal((await loanService.createLoan(entrada(user.id, book.id))).bookId, book.id);
  });

  test("CT15 / CA20 e CA21: mesmo livro já aberto é rejeitado", async () => {
    const { loanService, loanRepository, bookService, user, book } = await preparar();
    await loanRepository.save(
      emprestimoAberto(user.id, book.id, { dueDate: "2026-10-01" })
    );
    await rejeitaCom(
      loanService.createLoan(entrada(user.id, book.id)),
      "BOOK_ALREADY_BORROWED"
    );
    assert.equal((await bookService.listBooks())[0].availableCopies, 2);
  });

  test("CA20: histórico devolvido do mesmo livro permite novo empréstimo", async () => {
    const { loanService, loanRepository, user, book } = await preparar();
    await loanRepository.save(
      emprestimoAberto(user.id, book.id, { returnDate: "2026-09-10" })
    );
    assert.equal((await loanService.createLoan(entrada(user.id, book.id))).bookId, book.id);
  });

  test("entrada inválida é rejeitada antes de consultar ou alterar estado", async () => {
    const { loanService, loanRepository, bookService, user, book } = await preparar();
    for (const invalid of [
      entrada(undefined, book.id),
      entrada(user.id, 0),
      entrada(user.id, book.id, "22/09/2026"),
      entrada(user.id, book.id, "2026-02-30"),
    ]) {
      await rejeitaCom(loanService.createLoan(invalid), "INVALID_LOAN");
    }
    assert.deepEqual(await loanRepository.findAll(), []);
    assert.equal((await bookService.listBooks())[0].availableCopies, 2);
  });

  test("RN08: falha na persistência do livro reverte empréstimo e estoque", async () => {
    const contexto = await preparar();
    contexto.bookRepository.save = async () => {
      throw new Error("falha simulada");
    };

    await assert.rejects(
      contexto.loanService.createLoan(entrada(contexto.user.id, contexto.book.id)),
      /falha simulada/
    );
    assert.deepEqual(await contexto.loanRepository.findAll(), []);
    assert.equal((await contexto.bookService.listBooks())[0].availableCopies, 2);
  });
});

describe("RF04 — API HTTP de empréstimos", () => {
  let api;
  let user;
  let book;

  beforeEach(async () => {
    api = await iniciarServidor();
    user = (await api.post("/users", { name: "Ana", email: "ana@exemplo.com" })).body;
    book = (
      await api.post("/books", {
        isbn: "ISBN-HTTP",
        title: "Clean Code",
        author: "Robert Martin",
        totalCopies: 2,
      })
    ).body;
  });

  afterEach(async () => api.fechar());

  test("POST /loans responde 201 e GET /loans mostra o empréstimo", async () => {
    const resposta = await api.post("/loans", entrada(user.id, book.id));
    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.dueDate, "2026-10-06");

    const lista = await api.get("/loans");
    assert.equal(lista.status, 200);
    assert.deepEqual(lista.body, [resposta.body]);
  });

  test("rejeições HTTP têm código identificável e preservam o acervo", async () => {
    await api.post("/loans", entrada(user.id, book.id));
    const duplicado = await api.post("/loans", entrada(user.id, book.id));
    assert.equal(duplicado.status, 409);
    assert.deepEqual(duplicado.body, { error: "BOOK_ALREADY_BORROWED" });

    const livros = await api.get("/books");
    assert.equal(livros.body[0].availableCopies, 1);
  });
});
