// Oráculo PR01-03 — RF01/CA01; RN09: disponibilidade inicial não é controlada pelo cliente.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo, livroValido } from "../../apoio.js";

test("PR01-03: availableCopies enviado na entrada é ignorado; disponível inicial = total", async () => {
  const { service } = novoAcervo();

  const criado = await service.createBook(livroValido({ totalCopies: 5, availableCopies: 1 }));

  assert.equal(criado.availableCopies, 5);
  const [armazenado] = await service.listBooks();
  assert.equal(armazenado.availableCopies, 5);
  assert.equal(armazenado.totalCopies, 5);
});
