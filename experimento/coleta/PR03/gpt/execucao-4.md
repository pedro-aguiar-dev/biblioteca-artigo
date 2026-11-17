Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `book.repository.js` — `matchesTerm()` | A busca usa `startsWith()`, portanto só considera correspondência parcial quando o termo aparece \*\*no início\*\* do título ou autor. | O termo deve poder corresponder a qualquer parte do título ou autor. Ex.: buscar `"anel"` deve encontrar `"O Senhor dos Anéis"` se houver a sequência correspondente no campo pesquisado. | Um livro só é encontrado quando o campo começa exatamente com o termo pesquisado. Correspondências no meio ou no fim são ignoradas. | \*\*CA10 — A pesquisa deve aceitar correspondência parcial.\*\* |

| `book.repository.js` — `matchesTerm()` | Apenas o termo pesquisado é convertido para minúsculas (`term.toLowerCase()`); o texto do livro não é normalizado. | A comparação deve ignorar diferenças entre maiúsculas e minúsculas, normalizando ambos os lados ou usando comparação case-insensitive. | Ex.: um livro com título `"Clean Code"` não será encontrado por `"clean"`, pois `"Clean Code".startsWith("clean")` retorna `false`. | \*\*CA11 — A pesquisa não deve diferenciar letras maiúsculas e minúsculas.\*\* |

| `book.service.js` — `searchBooks()` | A busca por autor só é executada quando \*\*nenhum\*\* resultado por título é encontrado. Isso impede a união dos resultados das duas formas de pesquisa. | Devem ser retornados todos os livros cujo \*\*título ou autor\*\* seja compatível com o termo. | Se existir ao menos um livro compatível pelo título, qualquer outro livro compatível apenas pelo autor é ignorado. | \*\*RF03 — pesquisa por título ou autor\*\* e \*\*CA12 — Todos os livros compatíveis devem ser retornados.\*\* |

| `book.service.js` — `MAX\_SEARCH\_RESULTS` / `books.slice(0, MAX\_SEARCH\_RESULTS)` | O resultado é limitado artificialmente a 10 livros, embora não exista esse limite nos requisitos. | Todos os livros compatíveis devem ser retornados, independentemente da quantidade. | Se houver mais de 10 livros compatíveis, apenas os 10 primeiros são retornados. | \*\*CA12 — Todos os livros compatíveis devem ser retornados.\*\* |



O \*\*CA13\*\* parece ser atendido nos casos em que a pesquisa válida não encontra correspondências: os filtros retornam `\[]` e o serviço também devolve uma lista vazia.

