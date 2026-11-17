Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo Pull Request.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/books/book.repository.js`, função `matchesTerm()` — `return text.startsWith(query);` | A busca parcial foi implementada apenas como correspondência de \*\*prefixo\*\*. `startsWith()` não encontra o termo quando ele aparece no meio ou no final do título/autor. | Uma busca por `"anel"` deve, por exemplo, encontrar `"O Senhor dos Anéis"` caso o texto contenha esse trecho, independentemente da posição. | O livro só é encontrado se título/autor \*\*começar\*\* exatamente com o termo pesquisado. | \*\*CA10 — A pesquisa deve aceitar correspondência parcial.\*\* |

| `src/books/book.repository.js`, função `matchesTerm()` — `const query = term.toLowerCase(); return text.startsWith(query);` | Apenas o termo pesquisado é convertido para minúsculas; o texto do livro não é normalizado. Isso torna a comparação sensível a maiúsculas/minúsculas. | Título/autor e termo devem ser comparados sem considerar caixa. Ex.: `"machado"` deve encontrar autor `"Machado de Assis"`. | `"Machado de Assis".startsWith("machado")` retorna `false`. | \*\*CA11 — A pesquisa não deve diferenciar letras maiúsculas e minúsculas.\*\* |

| `src/books/book.service.js`, método `searchBooks()` — `const books = byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term);` | A pesquisa por autor só é executada quando \*\*nenhum\*\* livro corresponde pelo título. Assim, resultados válidos de autor são descartados sempre que existir pelo menos uma correspondência de título. | Devem ser retornados todos os livros cujo \*\*título ou autor\*\* corresponda ao termo. | Se houver ao menos um resultado por título, somente resultados de título são devolvidos, mesmo que outros livros tenham autor compatível. | \*\*RF03 — pesquisa por título ou autor; CA12 — Todos os livros compatíveis devem ser retornados.\*\* |

| `src/books/book.service.js`, método `searchBooks()` — `return books.slice(0, MAX\_SEARCH\_RESULTS);` e `MAX\_SEARCH\_RESULTS = 10` | Foi imposto um limite de 10 resultados que não existe nos requisitos. | Todos os livros compatíveis devem ser retornados. | Quando houver mais de 10 correspondências, apenas as 10 primeiras são retornadas. | \*\*CA12 — Todos os livros compatíveis devem ser retornados.\*\* |



O \*\*CA13\*\* está atendido para termos válidos sem correspondência: os filtros retornam arrays vazios e o serviço termina retornando `\[]`.



Não considerei o tratamento de `q` vazio/ausente como defeito, porque os requisitos fornecidos não especificam qual deve ser o comportamento nesse caso.

