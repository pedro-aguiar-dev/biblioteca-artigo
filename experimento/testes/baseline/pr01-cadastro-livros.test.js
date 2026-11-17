// Baseline do PR01 — RF01 Cadastrar livro (CA01–CA05; CT01–CT03 da ESP).
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  novoAcervo,
  livroValido,
  fotografarAcervo,
  rejeitaCom,
  iniciarServidor,
} from "../apoio.js";

describe("RF01 — serviço de cadastro de livros", () => {
  let service;

  beforeEach(() => {
    ({ service } = novoAcervo());
  });

  test("CT01 / CA01: livro com dois exemplares é criado com dois disponíveis", async () => {
    const livro = await service.createBook(livroValido({ totalCopies: 2 }));

    assert.equal(livro.totalCopies, 2);
    assert.equal(livro.availableCopies, 2);
    assert.ok(livro.id !== undefined);
    assert.deepEqual(await service.listBooks(), [livro]);
  });

  test("CA01: disponibilidade inicial informada pelo cliente é ignorada", async () => {
    const livro = await service.createBook(livroValido({ totalCopies: 5, availableCopies: 1 }));

    assert.equal(livro.availableCopies, 5);
    const [armazenado] = await service.listBooks();
    assert.equal(armazenado.availableCopies, 5);
  });

  test("CT02 / CA02: outro livro com o mesmo ISBN é rejeitado e o acervo fica inalterado", async () => {
    await service.createBook(livroValido());
    const antes = await fotografarAcervo(service);

    await rejeitaCom(service.createBook(livroValido()), "ISBN_ALREADY_EXISTS");

    assert.deepEqual(await service.listBooks(), antes);
  });

  test("CA02: mesmo ISBN com título e autor diferentes também é rejeitado", async () => {
    await service.createBook(livroValido({ title: "Estruturas de Dados" }));
    const antes = await fotografarAcervo(service);

    await rejeitaCom(
      service.createBook(livroValido({ title: "Estrutura de Dados", author: "Outro Autor" })),
      "ISBN_ALREADY_EXISTS"
    );

    assert.deepEqual(await service.listBooks(), antes);
  });

  test("CA02: ISBN obrigatório (ausente, vazio ou só espaços)", async () => {
    for (const isbn of [undefined, "", "   "]) {
      await rejeitaCom(service.createBook(livroValido({ isbn })), "INVALID_BOOK");
    }
    assert.deepEqual(await service.listBooks(), []);
  });

  test("ISBNs diferentes geram livros distintos", async () => {
    const a = await service.createBook(livroValido({ isbn: "111" }));
    const b = await service.createBook(livroValido({ isbn: "222" }));

    assert.notEqual(a.id, b.id);
    assert.equal((await service.listBooks()).length, 2);
  });

  test("CT03 / CA03: título vazio é rejeitado sem alterar o acervo", async () => {
    await service.createBook(livroValido({ isbn: "111" }));
    const antes = await fotografarAcervo(service);

    for (const title of [undefined, "", "   "]) {
      await rejeitaCom(service.createBook(livroValido({ isbn: "222", title })), "INVALID_BOOK");
    }

    assert.deepEqual(await service.listBooks(), antes);
  });

  test("CA03: autor vazio é rejeitado sem alterar o acervo", async () => {
    for (const author of [undefined, "", "   "]) {
      await rejeitaCom(service.createBook(livroValido({ author })), "INVALID_BOOK");
    }
    assert.deepEqual(await service.listBooks(), []);
  });

  test("CT03 / CA04: zero exemplares é rejeitado sem alterar o acervo", async () => {
    await rejeitaCom(service.createBook(livroValido({ totalCopies: 0 })), "INVALID_QUANTITY");
    assert.deepEqual(await service.listBooks(), []);
  });

  test("CA04: quantidade negativa, fracionária, textual ou ausente é rejeitada", async () => {
    for (const totalCopies of [-1, -5, 1.5, "2", undefined, null]) {
      await rejeitaCom(service.createBook(livroValido({ totalCopies })), "INVALID_QUANTITY");
    }
    assert.deepEqual(await service.listBooks(), []);
  });

  test("CA04: um exemplar é aceito", async () => {
    const livro = await service.createBook(livroValido({ totalCopies: 1 }));
    assert.equal(livro.availableCopies, 1);
  });
});

describe("RF01 — API HTTP de livros", () => {
  let api;

  beforeEach(async () => {
    api = await iniciarServidor();
  });

  afterEach(async () => {
    await api.fechar();
  });

  test("POST /books válido responde 201 com o livro criado", async () => {
    const resposta = await api.post("/books", livroValido({ totalCopies: 2 }));

    assert.equal(resposta.status, 201);
    assert.equal(resposta.body.availableCopies, 2);
    assert.equal(resposta.body.totalCopies, 2);
  });

  test("POST /books inválido responde 400 com código identificável e não altera o acervo", async () => {
    const resposta = await api.post("/books", livroValido({ title: "" }));

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.body, { error: "INVALID_BOOK" });
    assert.deepEqual((await api.get("/books")).body, []);
  });

  test("POST /books com quantidade inválida responde 400 INVALID_QUANTITY", async () => {
    const resposta = await api.post("/books", livroValido({ totalCopies: 0 }));

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.body, { error: "INVALID_QUANTITY" });
  });

  test("POST /books com ISBN repetido responde 409 e não altera o acervo", async () => {
    await api.post("/books", livroValido());
    const antes = (await api.get("/books")).body;

    const resposta = await api.post("/books", livroValido({ title: "Outro título" }));

    assert.equal(resposta.status, 409);
    assert.deepEqual(resposta.body, { error: "ISBN_ALREADY_EXISTS" });
    assert.deepEqual((await api.get("/books")).body, antes);
  });

  test("POST /books sem corpo responde 400", async () => {
    const resposta = await api.post("/books");

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.body, { error: "INVALID_BOOK" });
  });

  test("GET /books lista o acervo cadastrado", async () => {
    await api.post("/books", livroValido({ isbn: "111" }));
    await api.post("/books", livroValido({ isbn: "222", totalCopies: 3 }));

    const resposta = await api.get("/books");

    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.length, 2);
    assert.deepEqual(
      resposta.body.map((livro) => [livro.isbn, livro.totalCopies, livro.availableCopies]),
      [["111", 2, 2], ["222", 3, 3]]
    );
  });
});
