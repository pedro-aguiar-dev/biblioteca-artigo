// Oráculo PR02-05 — RF07/CA34, CA36: e-mail continua único na atualização, independentemente
// da posição do outro usuário no conjunto de dados (aqui, além dos 100 primeiros).
import { test } from "node:test";
import assert from "node:assert/strict";
import { novoCadastroDeUsuarios, fotografarUsuarios, rejeitaCom } from "../../apoio.js";

test("PR02-05: atualizar para o e-mail do 150º usuário é rejeitado e nada muda", async () => {
  const { service, repository } = novoCadastroDeUsuarios();
  const usuarios = [];
  for (let i = 1; i <= 150; i++) {
    usuarios.push(await service.createUser({ name: `Usuário ${i}`, email: `usuario${i}@exemplo.com` }));
  }
  const antes = await fotografarUsuarios(repository);

  await rejeitaCom(
    service.updateEmail(usuarios[0].id, { email: "usuario150@exemplo.com" }),
    "EMAIL_ALREADY_EXISTS"
  );

  assert.deepEqual(await fotografarUsuarios(repository), antes);
});
