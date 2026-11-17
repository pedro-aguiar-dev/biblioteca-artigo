// Oráculo PR03-06 (substituto do PR03-05) — RF03/CA12: todos os livros compatíveis são retornados.
// Títulos em minúsculas com o termo no início, para não depender de PR03-01 nem de PR03-04.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo } from "../../apoio.js";

test("PR03-06: 12 livros compatíveis retornam os 12", async () => {
  const { service } = novoAcervo();
  for (let i = 1; i <= 12; i++) {
    await service.createBook({ isbn: `T${i}`, title: `termo ${i}`, author: "Autor", totalCopies: 1 });
  }

  const resultado = await service.searchBooks("termo");

  assert.equal(resultado.length, 12);
  assert.deepEqual(resultado.map((livro) => livro.isbn).at(-1), "T12");
});
