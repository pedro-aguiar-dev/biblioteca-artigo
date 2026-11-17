// Baseline do PR02 — RF02 Cadastrar usuário (CA06–CA09; CT04–CT06 da ESP)
// e RF07 Atualizar e-mail de usuário (CA33–CA36; requisito adicional, ver X05 em DECISOES.md).
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  novoCadastroDeUsuarios,
  usuarioValido,
  fotografarUsuarios,
  rejeitaCom,
  iniciarServidor,
} from "../apoio.js";

async function cadastrarVarios(service, quantidade) {
  const criados = [];
  for (let i = 1; i <= quantidade; i++) {
    criados.push(await service.createUser({ name: `Usuário ${i}`, email: `usuario${i}@exemplo.com` }));
  }
  return criados;
}

describe("RF02 — serviço de cadastro de usuários", () => {
  let service;
  let repository;

  beforeEach(() => {
    ({ service, repository } = novoCadastroDeUsuarios());
  });

  test("CT04 / CA06: usuário com nome e e-mail válidos é armazenado", async () => {
    const usuario = await service.createUser(usuarioValido());

    assert.equal(usuario.name, "Ana Souza");
    assert.equal(usuario.email, "ana@exemplo.com");
    assert.ok(usuario.id !== undefined);
    assert.deepEqual(await fotografarUsuarios(repository), [usuario]);
  });

  test("e-mails diferentes geram usuários distintos", async () => {
    const a = await service.createUser(usuarioValido({ email: "a@exemplo.com" }));
    const b = await service.createUser(usuarioValido({ email: "b@exemplo.com" }));

    assert.notEqual(a.id, b.id);
    assert.equal((await fotografarUsuarios(repository)).length, 2);
  });

  test("CT05 / CA07: e-mail já existente é rejeitado sem alterar os usuários", async () => {
    await service.createUser(usuarioValido());
    const antes = await fotografarUsuarios(repository);

    await rejeitaCom(
      service.createUser(usuarioValido({ name: "Outra Pessoa" })),
      "EMAIL_ALREADY_EXISTS"
    );

    assert.deepEqual(await fotografarUsuarios(repository), antes);
  });

  test("CA07: e-mail repetido é rejeitado mesmo com mais de 100 usuários cadastrados", async () => {
    await cadastrarVarios(service, 150);
    const antes = await fotografarUsuarios(repository);

    await rejeitaCom(
      service.createUser({ name: "Repetido", email: "usuario150@exemplo.com" }),
      "EMAIL_ALREADY_EXISTS"
    );

    assert.deepEqual(await fotografarUsuarios(repository), antes);
  });

  test("CA07: e-mail obrigatório (ausente, vazio ou só espaços)", async () => {
    for (const email of [undefined, "", "   "]) {
      await rejeitaCom(service.createUser(usuarioValido({ email })), "INVALID_USER");
    }
    assert.deepEqual(await fotografarUsuarios(repository), []);
  });

  test("CT06 / CA08: nome vazio é rejeitado", async () => {
    for (const name of [undefined, "", "   "]) {
      await rejeitaCom(service.createUser(usuarioValido({ name })), "INVALID_USER");
    }
    assert.deepEqual(await fotografarUsuarios(repository), []);
  });

  test("CT06 / CA08: e-mail inválido é rejeitado", async () => {
    for (const email of ["ana.exemplo.com", "ana@", "@exemplo.com", "ana @exemplo.com", "ana@exemplo", 123]) {
      await rejeitaCom(service.createUser(usuarioValido({ email })), "INVALID_USER");
    }
    assert.deepEqual(await fotografarUsuarios(repository), []);
  });

  test("CA08 / CA09: nome vazio e e-mail inválido juntos são rejeitados sem criar usuário", async () => {
    await service.createUser(usuarioValido({ email: "existente@exemplo.com" }));
    const antes = await fotografarUsuarios(repository);

    await rejeitaCom(service.createUser({ name: "", email: "invalido" }), "INVALID_USER");

    assert.deepEqual(await fotografarUsuarios(repository), antes);
  });
});

describe("RF07 — serviço de atualização de e-mail", () => {
  let service;
  let repository;

  beforeEach(() => {
    ({ service, repository } = novoCadastroDeUsuarios());
  });

  test("RF07: e-mail é atualizado e os demais dados são mantidos", async () => {
    const usuario = await service.createUser(usuarioValido());

    const atualizado = await service.updateEmail(usuario.id, { email: "ana.nova@exemplo.com" });

    assert.deepEqual(atualizado, { name: "Ana Souza", email: "ana.nova@exemplo.com", id: usuario.id });
    assert.deepEqual(await fotografarUsuarios(repository), [atualizado]);
  });

  test("RF07: o e-mail antigo fica livre para outro cadastro", async () => {
    const usuario = await service.createUser(usuarioValido());
    await service.updateEmail(usuario.id, { email: "ana.nova@exemplo.com" });

    const outro = await service.createUser({ name: "Bruno", email: "ana@exemplo.com" });

    assert.equal(outro.email, "ana@exemplo.com");
  });

  test("CA33 / CA36: e-mail inválido é rejeitado sem alterar o usuário", async () => {
    const usuario = await service.createUser(usuarioValido());
    const antes = await fotografarUsuarios(repository);

    for (const email of [undefined, "", "invalido", "ana@exemplo"]) {
      await rejeitaCom(service.updateEmail(usuario.id, { email }), "INVALID_EMAIL");
    }

    assert.deepEqual(await fotografarUsuarios(repository), antes);
  });

  test("CA34 / CA36: e-mail de outro usuário é rejeitado sem alterar os dados", async () => {
    await service.createUser(usuarioValido({ email: "ana@exemplo.com" }));
    const bruno = await service.createUser({ name: "Bruno", email: "bruno@exemplo.com" });
    const antes = await fotografarUsuarios(repository);

    await rejeitaCom(service.updateEmail(bruno.id, { email: "ana@exemplo.com" }), "EMAIL_ALREADY_EXISTS");

    assert.deepEqual(await fotografarUsuarios(repository), antes);
  });

  test("CA34 / CA36: e-mail de outro usuário é rejeitado mesmo além dos 100 primeiros", async () => {
    const usuarios = await cadastrarVarios(service, 150);
    const antes = await fotografarUsuarios(repository);

    await rejeitaCom(
      service.updateEmail(usuarios[0].id, { email: "usuario150@exemplo.com" }),
      "EMAIL_ALREADY_EXISTS"
    );

    assert.deepEqual(await fotografarUsuarios(repository), antes);
  });

  test("CA34: manter o próprio e-mail é permitido", async () => {
    const usuario = await service.createUser(usuarioValido());

    const atualizado = await service.updateEmail(usuario.id, { email: "ana@exemplo.com" });

    assert.equal(atualizado.email, "ana@exemplo.com");
  });

  test("CA35: usuário inexistente é rejeitado", async () => {
    await service.createUser(usuarioValido());
    const antes = await fotografarUsuarios(repository);

    for (const id of [99, NaN]) {
      await rejeitaCom(service.updateEmail(id, { email: "novo@exemplo.com" }), "USER_NOT_FOUND");
    }

    assert.deepEqual(await fotografarUsuarios(repository), antes);
  });
});

describe("Listagem paginada de usuários (auxiliar, X06)", () => {
  let service;

  beforeEach(async () => {
    ({ service } = novoCadastroDeUsuarios());
    await cadastrarVarios(service, 25);
  });

  test("página padrão traz os 20 primeiros; a página 1 traz o restante", async () => {
    const primeira = await service.listUsers();
    const segunda = await service.listUsers({ page: 1 });

    assert.equal(primeira.length, 20);
    assert.equal(primeira[0].email, "usuario1@exemplo.com");
    assert.equal(segunda.length, 5);
    assert.equal(segunda[0].email, "usuario21@exemplo.com");
  });

  test("tamanho de página até 100 é aceito", async () => {
    assert.equal((await service.listUsers({ page: 0, size: 100 })).length, 25);
  });

  test("paginação inválida é rejeitada", async () => {
    for (const parametros of [{ page: -1 }, { page: 1.5 }, { page: NaN }, { size: 0 }, { size: 101 }, { size: NaN }]) {
      await rejeitaCom(service.listUsers(parametros), "INVALID_PAGINATION");
    }
  });
});

describe("RF02 / RF07 — API HTTP de usuários", () => {
  let api;

  beforeEach(async () => {
    api = await iniciarServidor();
  });

  afterEach(async () => {
    await api.fechar();
  });

  test("POST /users válido responde 201", async () => {
    const resposta = await api.post("/users", usuarioValido());

    assert.equal(resposta.status, 201);
    assert.deepEqual(resposta.body, { name: "Ana Souza", email: "ana@exemplo.com", id: 1 });
  });

  test("POST /users inválido responde 400 INVALID_USER e não cria usuário", async () => {
    const resposta = await api.post("/users", usuarioValido({ name: "" }));

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.body, { error: "INVALID_USER" });
    assert.deepEqual((await api.get("/users")).body, []);
  });

  test("POST /users com e-mail repetido responde 409", async () => {
    await api.post("/users", usuarioValido());

    const resposta = await api.post("/users", usuarioValido({ name: "Outra" }));

    assert.equal(resposta.status, 409);
    assert.deepEqual(resposta.body, { error: "EMAIL_ALREADY_EXISTS" });
  });

  test("PATCH /users/:id/email atualiza, valida, protege unicidade e trata usuário inexistente", async () => {
    await api.post("/users", usuarioValido());
    await api.post("/users", { name: "Bruno", email: "bruno@exemplo.com" });

    const ok = await api.patch("/users/2/email", { email: "bruno.novo@exemplo.com" });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.email, "bruno.novo@exemplo.com");

    const invalido = await api.patch("/users/2/email", { email: "invalido" });
    assert.equal(invalido.status, 400);
    assert.deepEqual(invalido.body, { error: "INVALID_EMAIL" });

    const ocupado = await api.patch("/users/2/email", { email: "ana@exemplo.com" });
    assert.equal(ocupado.status, 409);
    assert.deepEqual(ocupado.body, { error: "EMAIL_ALREADY_EXISTS" });

    for (const id of ["99", "abc"]) {
      const inexistente = await api.patch(`/users/${id}/email`, { email: "x@exemplo.com" });
      assert.equal(inexistente.status, 404);
      assert.deepEqual(inexistente.body, { error: "USER_NOT_FOUND" });
    }

    const lista = (await api.get("/users")).body;
    assert.deepEqual(lista.map((u) => u.email), ["ana@exemplo.com", "bruno.novo@exemplo.com"]);
  });

  test("GET /users pagina e valida os parâmetros", async () => {
    await api.post("/users", usuarioValido());
    await api.post("/users", { name: "Bruno", email: "bruno@exemplo.com" });

    const pagina = await api.get("/users?page=1&size=1");
    assert.equal(pagina.status, 200);
    assert.deepEqual(pagina.body.map((u) => u.id), [2]);

    for (const consulta of ["size=0", "size=101", "page=-1", "page=abc"]) {
      const resposta = await api.get(`/users?${consulta}`);
      assert.equal(resposta.status, 400);
      assert.deepEqual(resposta.body, { error: "INVALID_PAGINATION" });
    }
  });
});
