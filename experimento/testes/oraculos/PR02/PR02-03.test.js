// Oráculo PR02-03 — RF02/CA08, CA09; RN08: tentativa inválida não cria usuário.
// Usa nome vazio E e-mail inválido juntos: a entrada é rejeitada tanto com "||" quanto com "&&",
// para não depender da lógica booleana da validação (PR02-04).
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoCadastroDeUsuarios, fotografarUsuarios, rejeitaCom } from "../../apoio.js";

test("PR02-03: cadastro inválido é rejeitado sem deixar registro", async () => {
  const { service, repository } = novoCadastroDeUsuarios();
  await service.createUser({ name: "Ana Souza", email: "ana@exemplo.com" });
  const antes = await fotografarUsuarios(repository);

  await rejeitaCom(service.createUser({ name: "", email: "invalido" }), "INVALID_USER");

  assert.deepEqual(await fotografarUsuarios(repository), antes);
});
