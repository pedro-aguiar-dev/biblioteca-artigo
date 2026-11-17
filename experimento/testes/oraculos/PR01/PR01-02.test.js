// Oráculo PR01-02 — RF01/CA03, CA05; RN08: cadastro inválido não cria registro.
// Usa título vazio com quantidade válida, para não depender da validação de quantidade (PR01-04).
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo, livroValido, fotografarAcervo, rejeitaCom } from "../../apoio.js";

test("PR01-02: cadastro com título vazio é rejeitado sem criar registro", async () => {
  const { service } = novoAcervo();
  await service.createBook(livroValido({ isbn: "111" }));
  const antes = await fotografarAcervo(service);

  await rejeitaCom(
    service.createBook(livroValido({ isbn: "222", title: "", totalCopies: 2 })),
    "INVALID_BOOK"
  );

  assert.deepEqual(await service.listBooks(), antes);
});
