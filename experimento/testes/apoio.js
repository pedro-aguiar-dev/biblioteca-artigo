import assert from "node:assert/strict";
import {
  createApp,
  BookRepository,
  BookService,
  UserRepository,
  UserService,
  LoanRepository,
  LoanService,
} from "./sistema.js";

export function novoAcervo() {
  const repository = new BookRepository();
  return { repository, service: new BookService(repository) };
}

export function livroValido(campos = {}) {
  return {
    isbn: "9780000000001",
    title: "Estruturas de Dados",
    author: "Ana Souza",
    totalCopies: 2,
    ...campos,
  };
}

export async function fotografarAcervo(service) {
  return structuredClone(await service.listBooks());
}

export function novoCadastroDeUsuarios() {
  const repository = new UserRepository();
  return { repository, service: new UserService(repository) };
}

export function usuarioValido(campos = {}) {
  return { name: "Ana Souza", email: "ana@exemplo.com", ...campos };
}

// Todos os usuários armazenados, sem o limite de página do serviço (cópia profunda).
export async function fotografarUsuarios(repository) {
  return structuredClone(await repository.findAll({ page: 0, size: Number.MAX_SAFE_INTEGER }));
}

export function novoServicoDeEmprestimos() {
  const bookRepository = new BookRepository();
  const bookService = new BookService(bookRepository);
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const loanRepository = new LoanRepository();
  const loanService = new LoanService(loanRepository, bookRepository, userRepository);
  return {
    bookRepository,
    bookService,
    userRepository,
    userService,
    loanRepository,
    loanService,
  };
}

export async function rejeitaCom(promessa, codigo) {
  await assert.rejects(promessa, (erro) => {
    assert.equal(erro.code, codigo);
    return true;
  });
}

export async function iniciarServidor() {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function requisitar(metodo, caminho, corpo) {
    const resposta = await fetch(baseUrl + caminho, {
      method: metodo,
      headers: corpo === undefined ? {} : { "content-type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    return { status: resposta.status, body: await resposta.json() };
  }

  return {
    post: (caminho, corpo) => requisitar("POST", caminho, corpo),
    patch: (caminho, corpo) => requisitar("PATCH", caminho, corpo),
    get: (caminho) => requisitar("GET", caminho),
    async fechar() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
