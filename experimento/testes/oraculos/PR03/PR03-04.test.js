// Oráculo PR03-04 — RF03/CA10: correspondência parcial em qualquer posição do texto.
// Termos em minúsculas no meio e no fim do título, para não depender de PR03-01.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo } from "../../apoio.js";

test("PR03-04: termo no fim ou no meio do título é encontrado", async () => {
  const { service } = novoAcervo();
  await service.createBook({ isbn: "1", title: "Estruturas de dados", author: "Bruno Lima", totalCopies: 1 });
  await service.createBook({ isbn: "2", title: "Guia de padrões de projeto", author: "Carla Dias", totalCopies: 1 });

  assert.deepEqual((await service.searchBooks("dados")).map((livro) => livro.isbn), ["1"]);
  assert.deepEqual((await service.searchBooks("padrões")).map((livro) => livro.isbn), ["2"]);
});
