// Oráculo PR01-04 — RF01/CA04: quantidade total maior que zero.
// Verifica só rejeição/aceitação (não o acervo), em acervos separados, para não depender da
// ordem validação/persistência (PR01-02).
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo, livroValido, rejeitaCom } from "../../apoio.js";

test("PR01-04: quantidade 0 é rejeitada", async () => {
  const { service } = novoAcervo();
  await rejeitaCom(service.createBook(livroValido({ totalCopies: 0 })), "INVALID_QUANTITY");
});

test("PR01-04: quantidade -1 é rejeitada", async () => {
  const { service } = novoAcervo();
  await rejeitaCom(service.createBook(livroValido({ totalCopies: -1 })), "INVALID_QUANTITY");
});

test("PR01-04: quantidade 1 é aceita", async () => {
  const { service } = novoAcervo();
  const livro = await service.createBook(livroValido({ totalCopies: 1 }));
  assert.equal(livro.totalCopies, 1);
});
