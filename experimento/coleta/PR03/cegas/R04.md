\# Revisão do Pull Request: RF03 – Consultar acervo



Encontrei \*\*4 defeitos funcionais\*\*.



\---



\## Defeito 1: Correspondência apenas por prefixo (não parcial)



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm` (`text.startsWith(query)`)



\*\*Descrição do problema:\*\* A comparação usa `startsWith`, então só encontra livros cujo título/autor \*começa\* com o termo. Termos que aparecem no meio do texto não são encontrados.



\*\*Comportamento esperado:\*\* Correspondência parcial em qualquer posição do texto. Buscar "ring" deve encontrar "O Senhor dos Anéis: The Lord of the Rings".



\*\*Comportamento atual:\*\* Buscar "ring" ou "Machado" (em "Joaquim Maria Machado de Assis") não retorna o livro, pois o texto não começa com o termo.



\*\*Requisito relacionado:\*\* CA10 (e CA12, pois livros compatíveis deixam de ser retornados).



\---



\## Defeito 2: Busca sensível a maiúsculas/minúsculas



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm`



\*\*Descrição do problema:\*\* Apenas o termo (`term`) é convertido para minúsculas; o texto do livro (`text`) não é normalizado. Assim, qualquer título/autor com letra maiúscula nunca coincide com o termo.



\*\*Comportamento esperado:\*\* A comparação ignora caixa nos dois lados. "dom casmurro", "DOM CASMURRO" e "Dom Casmurro" devem retornar o mesmo resultado.



\*\*Comportamento atual:\*\* Com o título "Dom Casmurro", a busca por "dom" vira `"dom"` e é comparada com `"Dom Casmurro"`, resultando em falso. Na prática, a busca falha para quase todo título que começa com maiúscula, e buscar "Dom" também falha, pois o termo é minimizado e o texto não.



\*\*Requisito relacionado:\*\* CA11.



\---



\## Defeito 3: Autor só é consultado se não houver resultado por título



\*\*Localização:\*\* `src/books/book.service.js`, método `searchBooks`



```js

const books = byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term);

```



\*\*Descrição do problema:\*\* A busca por autor só ocorre quando a busca por título retorna vazio. Os resultados dos dois critérios não são combinados (união).



\*\*Comportamento esperado:\*\* Retornar todos os livros cujo título \*\*ou\*\* autor correspondam ao termo, sem duplicatas.



\*\*Comportamento atual:\*\* Se o termo casar com ao menos um título, os livros cujo autor casa com o termo são omitidos. Exemplo: o termo "Machado" casa com o título "Machado de Assis: Biografia" e, por isso, os livros de autoria de Machado de Assis não aparecem.



\*\*Requisito relacionado:\*\* RF03 (pesquisa por título \*ou\* autor) e CA12.



\---



\## Defeito 4: Limite arbitrário de 10 resultados



\*\*Localização:\*\* `src/books/book.service.js`, constante `MAX\_SEARCH\_RESULTS` e `books.slice(0, MAX\_SEARCH\_RESULTS)`



\*\*Descrição do problema:\*\* O resultado é truncado em 10 itens, sem respaldo em nenhum requisito e sem paginação.



\*\*Comportamento esperado:\*\* Todos os livros compatíveis devem ser retornados.



\*\*Comportamento atual:\*\* Se 25 livros casam com o termo, apenas 10 são devolvidos, sem indicação de que houve truncamento.



\*\*Requisito relacionado:\*\* CA12.



\---



\## Ponto adicional a verificar (possível defeito)



\*\*Localização:\*\* `src/books/book.service.js`, `searchBooks` com `isBlank(term)`



Quando `q` não é informado, `req.query.q` é `undefined`. Dependendo da implementação de `isBlank` (não visível no diff), isso pode funcionar corretamente (lançando `INVALID\_SEARCH\_TERM`) ou causar um `TypeError`. Além disso, se `q` vier repetido (`?q=a\&q=b`), o valor será um array, o que quebraria `toLowerCase()`. Os requisitos fornecidos não definem o comportamento para termo vazio, então não classifico como defeito confirmado, mas vale validar o tratamento e o mapeamento do erro para a resposta HTTP.



\---



\## Resumo



| # | Defeito | Requisito |

|---|---------|-----------|

| 1 | `startsWith` em vez de contém | CA10, CA12 |

| 2 | Texto do livro não normalizado para minúsculas | CA11 |

| 3 | Autor consultado só se título não retornar nada | RF03, CA12 |

| 4 | Limite de 10 resultados | CA12 |



CA13 (lista vazia sem correspondência) é atendido pela implementação atual.

