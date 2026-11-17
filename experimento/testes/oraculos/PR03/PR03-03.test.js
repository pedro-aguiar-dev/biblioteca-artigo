// Oráculo PR03-03 — RF03/CA10, CA12: busca por título OU autor retorna todos os compatíveis.
// Dados em minúsculas e com o termo no início do texto, para não depender de PR03-01 nem de PR03-04.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo } from "../../apoio.js";

test("PR03-03: termo no título de um livro e no autor de outro retorna os dois", async () => {
  const { service } = novoAcervo();
  await service.createBook({ isbn: "1", title: "termo no título", author: "Fulano de Tal", totalCopies: 1 });
  await service.createBook({ isbn: "2", title: "Outro livro", author: "termo no autor", totalCopies: 1 });
  await service.createBook({ isbn: "3", title: "Sem relação", author: "Ninguém", totalCopies: 1 });

  const resultado = await service.searchBooks("termo");

  assert.deepEqual(resultado.map((livro) => livro.isbn), ["1", "2"]);
});
