Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `book.repository.js` — `matchesTerm()` | A busca usa `startsWith`, portanto só encontra o termo quando ele aparece no início do título/autor. Isso não atende correspondência parcial em qualquer posição do texto. | Uma busca por `"senhor"` deveria encontrar, por exemplo, `"O Senhor dos Anéis"`. | `"O Senhor dos Anéis".startsWith("senhor")` retorna `false`. | \*\*CA10 — A pesquisa deve aceitar correspondência parcial.\*\* |

| `book.repository.js` — `matchesTerm()` | Apenas o termo pesquisado é convertido para minúsculas; o texto do livro não é normalizado. Assim, a pesquisa continua sensível a maiúsculas/minúsculas. | `"harry"` deve encontrar `"Harry Potter"`, independentemente da capitalização. | O código compara `"Harry Potter".startsWith("harry")`, que retorna `false`. | \*\*CA11 — A pesquisa não deve diferenciar letras maiúsculas e minúsculas.\*\* |

| `book.service.js` — `searchBooks()` | A pesquisa por autor só é executada quando \*\*nenhum\*\* resultado por título é encontrado. Se houver ao menos um título compatível, livros que correspondam somente pelo autor são descartados. | O resultado deve conter todos os livros cujo \*\*título ou autor\*\* corresponda ao termo. | `byTitle.length > 0 ? byTitle : searchByAuthor(...)` retorna exclusivamente resultados por título quando existe pelo menos um deles. | \*\*RF03 — pesquisa por título ou autor\*\* e \*\*CA12 — Todos os livros compatíveis devem ser retornados.\*\* |

| `book.service.js` — `return books.slice(0, MAX\_SEARCH\_RESULTS)` | O resultado é limitado artificialmente a 10 livros, embora os requisitos determinem que todos os livros compatíveis sejam retornados. | Se 15 livros forem compatíveis, os 15 devem ser retornados. | Apenas os primeiros 10 resultados são devolvidos. | \*\*CA12 — Todos os livros compatíveis devem ser retornados.\*\* |



Um exemplo que evidencia simultaneamente os problemas de título/autor é uma busca por `"tolkien"` em um acervo contendo um livro com título `"Tolkien: Uma Biografia"` e vários livros cujo autor seja `"J. R. R. Tolkien"`. Como existe um resultado pelo título, a implementação atual nem consulta os demais livros pelo autor.



Não identifiquei no trecho apresentado uma violação de \*\*CA13\*\*: quando as duas consultas não encontram correspondências, a implementação retorna naturalmente `\[]`.

