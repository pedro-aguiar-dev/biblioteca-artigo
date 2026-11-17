// Baseline do PR03 — RF03 Consultar acervo (CA10–CA13; CT07–CT09 da ESP).
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { novoAcervo, rejeitaCom, iniciarServidor } from "../apoio.js";

let isbnSequencial = 1;

async function cadastrar(service, title, author) {
  return service.createBook({ isbn: `ISBN-${isbnSequencial++}`, title, author, totalCopies: 1 });
}

const titulos = (livros) => livros.map((livro) => livro.title);

describe("RF03 — serviço de consulta ao acervo", () => {
  let service;

  beforeEach(async () => {
    ({ service } = novoAcervo());
    await cadastrar(service, "Clean Code", "Robert C. Martin");
    await cadastrar(service, "Clean Architecture", "Robert C. Martin");
    await cadastrar(service, "Introdução ao Código Limpo", "Ana Souza");
    await cadastrar(service, "Estruturas de Dados", "Bruno Lima");
    await cadastrar(service, "Java Efetivo", "Joshua Bloch");
    await cadastrar(service, "Programação Moderna", "Carla Java");
  });

  test("CT07 / CA11: parte do título com combinação diferente de maiúsculas encontra o livro", async () => {
    for (const termo of ["clean code", "CLEAN CODE", "cLeAn CoDe"]) {
      assert.deepEqual(titulos(await service.searchBooks(termo)), ["Clean Code"]);
    }
  });

  test("CT08 / CA12: parte do nome do autor retorna todos os livros correspondentes", async () => {
    assert.deepEqual(titulos(await service.searchBooks("martin")), ["Clean Code", "Clean Architecture"]);
  });

  test("CT09 / CA13: termo inexistente retorna lista vazia", async () => {
    assert.deepEqual(await service.searchBooks("inexistente"), []);
  });

  test("CA10: correspondência parcial no início, no meio e no fim do título", async () => {
    assert.deepEqual(titulos(await service.searchBooks("Estru")), ["Estruturas de Dados"]);
    assert.deepEqual(titulos(await service.searchBooks("ao Cód")), ["Introdução ao Código Limpo"]);
    assert.deepEqual(titulos(await service.searchBooks("limpo")), ["Introdução ao Código Limpo"]);
  });

  test("CA10 / CA11: correspondência parcial no autor sem diferenciar maiúsculas", async () => {
    assert.deepEqual(titulos(await service.searchBooks("SOUZA")), ["Introdução ao Código Limpo"]);
    assert.deepEqual(titulos(await service.searchBooks("na sou")), ["Introdução ao Código Limpo"]);
  });

  test("CA12: o mesmo termo no título de um livro e no autor de outro retorna os dois", async () => {
    assert.deepEqual(titulos(await service.searchBooks("java")), ["Java Efetivo", "Programação Moderna"]);
  });

  test("CA12: livro que corresponde no título e no autor aparece uma vez", async () => {
    const { service: outro } = novoAcervo();
    await cadastrar(outro, "Martin Fowler Essencial", "Martin Fowler");

    assert.deepEqual(titulos(await outro.searchBooks("martin")), ["Martin Fowler Essencial"]);
  });

  test("CA12: todos os compatíveis são retornados, sem limite de quantidade", async () => {
    const { service: grande } = novoAcervo();
    for (let i = 1; i <= 25; i++) await cadastrar(grande, `Volume ${i}`, "Autor");
    await cadastrar(grande, "Outro", "Ninguém");

    const resultado = await grande.searchBooks("volume");

    assert.equal(resultado.length, 25);
    assert.equal(resultado[0].title, "Volume 1");
    assert.equal(resultado[24].title, "Volume 25");
  });

  test("termo ausente ou em branco é rejeitado", async () => {
    for (const termo of [undefined, "", "   ", 123]) {
      await rejeitaCom(service.searchBooks(termo), "INVALID_SEARCH_TERM");
    }
  });

  test("a busca não altera o acervo", async () => {
    const antes = structuredClone(await service.listBooks());
    await service.searchBooks("clean");
    assert.deepEqual(await service.listBooks(), antes);
  });
});

describe("RF03 — API HTTP de consulta", () => {
  let api;

  beforeEach(async () => {
    api = await iniciarServidor();
    await api.post("/books", { isbn: "1", title: "Clean Code", author: "Robert C. Martin", totalCopies: 1 });
    await api.post("/books", { isbn: "2", title: "Estruturas de Dados", author: "Bruno Lima", totalCopies: 1 });
  });

  afterEach(async () => {
    await api.fechar();
  });

  test("GET /books/search?q= encontra por parte do título ou do autor, sem diferenciar maiúsculas", async () => {
    const porTitulo = await api.get("/books/search?q=CLEAN");
    assert.equal(porTitulo.status, 200);
    assert.deepEqual(titulos(porTitulo.body), ["Clean Code"]);

    const porAutor = await api.get("/books/search?q=lima");
    assert.deepEqual(titulos(porAutor.body), ["Estruturas de Dados"]);
  });

  test("GET /books/search sem correspondência responde 200 com lista vazia", async () => {
    const resposta = await api.get("/books/search?q=inexistente");
    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.body, []);
  });

  test("GET /books/search sem termo responde 400 INVALID_SEARCH_TERM", async () => {
    for (const consulta of ["", "?q=", "?q=%20%20"]) {
      const resposta = await api.get(`/books/search${consulta}`);
      assert.equal(resposta.status, 400);
      assert.deepEqual(resposta.body, { error: "INVALID_SEARCH_TERM" });
    }
  });
});
