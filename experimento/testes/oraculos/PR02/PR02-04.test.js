// Oráculo PR02-04 — RF02/CA08: nome vazio OU e-mail inválido causa rejeição.
// Verifica só a rejeição (não o armazenamento), em cadastros separados, para não depender da
// ordem validação/persistência (PR02-03).
import { test } from "node:test";
import { novoCadastroDeUsuarios, rejeitaCom } from "../../apoio.js";

test("PR02-04: nome vazio com e-mail válido é rejeitado", async () => {
  const { service } = novoCadastroDeUsuarios();
  await rejeitaCom(service.createUser({ name: "", email: "ana@exemplo.com" }), "INVALID_USER");
});

test("PR02-04: nome válido com e-mail inválido é rejeitado", async () => {
  const { service } = novoCadastroDeUsuarios();
  await rejeitaCom(service.createUser({ name: "Ana Souza", email: "ana.exemplo.com" }), "INVALID_USER");
});
