// Oráculo PR01-01 — RF01/CA02: ISBN único independentemente do título.
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo, fotografarAcervo, rejeitaCom } from "../../apoio.js";

test("PR01-01: ISBN repetido com título diferente é rejeitado e o acervo fica inalterado", async () => {
  const { service } = novoAcervo();
  await service.createBook({
    isbn: "978000000001",
    title: "Estruturas de Dados",
    author: "Ana Souza",
    totalCopies: 2,
  });
  const antes = await fotografarAcervo(service);

  await rejeitaCom(
    service.createBook({
      isbn: "978000000001",
      title: "Estrutura de Dados",
      author: "Ana Souza",
      totalCopies: 1,
    }),
    "ISBN_ALREADY_EXISTS"
  );

  assert.deepEqual(await service.listBooks(), antes);
});
