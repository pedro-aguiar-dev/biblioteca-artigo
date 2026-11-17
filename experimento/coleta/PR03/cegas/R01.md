Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR. Todos afetam diretamente os critérios de aceitação de RF03.



| # | Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|---|

| 1 | `book.repository.js`, função `matchesTerm` | A busca usa `startsWith`, portanto só encontra termos no \*\*início\*\* do título/autor, e não correspondências parciais em qualquer posição. | Pesquisar `"anel"` deveria encontrar, por exemplo, `"O Senhor dos Anéis"` caso o texto contenha o termo pesquisado. | `text.startsWith(query)` só retorna livros cujo título/autor começa exatamente pelo termo. | \*\*CA10\*\* — A pesquisa deve aceitar correspondência parcial. |

| 2 | `book.repository.js`, função `matchesTerm` | Apenas o termo pesquisado é convertido para minúsculas. O título/autor do livro não é normalizado. | `"hobbit"`, `"HOBBIT"` e `"Hobbit"` devem produzir os mesmos resultados. | `term.toLowerCase()` é comparado diretamente com `text`; por exemplo, `"hobbit"` não corresponde a `"Hobbit"`. | \*\*CA11\*\* — A pesquisa não deve diferenciar letras maiúsculas e minúsculas. |

| 3 | `book.service.js`, método `searchBooks` | A pesquisa por autor só é executada quando \*\*nenhum\*\* livro foi encontrado pelo título. Isso impede que resultados válidos das duas categorias sejam retornados juntos. | A pesquisa deve retornar todos os livros cujo \*\*título OU autor\*\* corresponda ao termo. | Se houver pelo menos um resultado por título, `searchByAuthor(term)` nem é chamado, descartando livros compatíveis somente pelo autor. | \*\*RF03\*\* e \*\*CA12\*\* — Pesquisa por título ou autor; todos os livros compatíveis devem ser retornados. |

| 4 | `book.service.js`, `MAX\_SEARCH\_RESULTS` / `books.slice(0, MAX\_SEARCH\_RESULTS)` | O serviço limita arbitrariamente o resultado a 10 livros, embora não exista esse limite nos requisitos. | Se 15 livros forem compatíveis, os 15 devem ser retornados. | Apenas os primeiros 10 resultados são retornados. | \*\*CA12\*\* — Todos os livros compatíveis devem ser retornados. |



\### Trechos problemáticos



O primeiro e o segundo defeitos estão concentrados aqui:



```js

function matchesTerm(text, term) {

&#x20; const query = term.toLowerCase();

&#x20; return text.startsWith(query);

}

```



Para atender a CA10 e CA11, a comparação precisaria ser equivalente a:



```js

return text.toLowerCase().includes(term.toLowerCase());

```



Já a lógica:



```js

const byTitle = await this.bookRepository.searchByTitle(term);

const books =

&#x20; byTitle.length > 0

&#x20;   ? byTitle

&#x20;   : await this.bookRepository.searchByAuthor(term);

```



viola a semântica de \*\*título OU autor\*\*, pois implementa na prática \*\*“título; caso não exista resultado, autor”\*\*.



Não identifiquei defeito referente ao \*\*CA13\*\* no código apresentado: quando nenhuma das pesquisas encontra livros, o fluxo retorna naturalmente `\[]`.

