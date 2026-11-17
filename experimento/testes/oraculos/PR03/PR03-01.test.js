// Oráculo PR03-01 — RF03/CA11: a pesquisa não diferencia maiúsculas e minúsculas.
// O termo está no início do título (não depende de correspondência no meio do texto — PR03-04).
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo } from "../../apoio.js";

test("PR03-01: 'clean', 'CLEAN' e 'Clean' encontram 'Clean Code'", async () => {
  const { service } = novoAcervo();
  await service.createBook({ isbn: "1", title: "Clean Code", author: "Robert Martin", totalCopies: 1 });
  await service.createBook({ isbn: "2", title: "Estruturas de Dados", author: "Bruno Lima", totalCopies: 1 });

  for (const termo of ["clean", "CLEAN", "Clean"]) {
    const resultado = await service.searchBooks(termo);
    assert.deepEqual(resultado.map((livro) => livro.title), ["Clean Code"], `termo "${termo}"`);
  }
});
