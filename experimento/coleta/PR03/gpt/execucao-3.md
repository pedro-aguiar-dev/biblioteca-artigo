Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR:



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `book.repository.js` — `matchesTerm()` | A busca usa `startsWith()`, aceitando correspondência apenas no início do título/autor. Isso não atende correspondência parcial em qualquer posição. | Uma busca por `"anel"` deve encontrar, por exemplo, `"O Senhor dos Anéis"`. | O livro só é encontrado se o campo começar exatamente com o termo pesquisado. | \*\*CA10 — A pesquisa deve aceitar correspondência parcial.\*\* |

| `book.repository.js` — `matchesTerm()` | Apenas o termo é convertido para minúsculas (`term.toLowerCase()`); o texto do livro não é normalizado. | `"harry"` deve encontrar `"Harry Potter"`, independentemente de maiúsculas/minúsculas. | `"Harry Potter".startsWith("harry")` retorna `false`, tornando a pesquisa sensível a maiúsculas/minúsculas dependendo de como os dados estão armazenados. | \*\*CA11 — A pesquisa não deve diferenciar letras maiúsculas e minúsculas.\*\* |

| `book.service.js` — `searchBooks()` | A pesquisa por autor só ocorre quando \*\*nenhum\*\* resultado por título foi encontrado: `byTitle.length > 0 ? byTitle : searchByAuthor(...)`. Com isso, resultados de título e autor não são combinados. | Devem ser retornados todos os livros cujo \*\*título ou autor\*\* corresponda ao termo. | Se existir pelo menos um título compatível, todos os livros compatíveis somente pelo autor são ignorados. | \*\*RF03 — pesquisa por título ou autor; CA12 — Todos os livros compatíveis devem ser retornados.\*\* |

| `book.service.js` — `searchBooks()` | O resultado é artificialmente limitado a 10 itens por `books.slice(0, MAX\_SEARCH\_RESULTS)`, embora nenhum requisito estabeleça paginação ou limite. | Todos os livros compatíveis devem ser retornados. | No máximo 10 livros são retornados, mesmo que existam mais resultados compatíveis. | \*\*CA12 — Todos os livros compatíveis devem ser retornados.\*\* |



Não identifiquei defeito relativo ao \*\*CA13\*\* no trecho apresentado: quando não há correspondência em título nem autor, os repositórios retornam arrays vazios e o resultado final também será `\[]`.

