// Oráculo PR02-02 — RF02/CA07: e-mail único na criação (entrada sem id).
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoCadastroDeUsuarios, fotografarUsuarios, rejeitaCom } from "../../apoio.js";

test("PR02-02: segundo cadastro com e-mail já existente é rejeitado e nada muda", async () => {
  const { service, repository } = novoCadastroDeUsuarios();
  await service.createUser({ name: "Ana Souza", email: "a@exemplo.com" });
  const antes = await fotografarUsuarios(repository);

  await rejeitaCom(
    service.createUser({ name: "Outra Pessoa", email: "a@exemplo.com" }),
    "EMAIL_ALREADY_EXISTS"
  );

  assert.deepEqual(await fotografarUsuarios(repository), antes);
});
