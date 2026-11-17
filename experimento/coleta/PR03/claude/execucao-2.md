\# Revisão do Pull Request – RF03 Consultar acervo



Encontrei \*\*4 defeitos funcionais\*\*.



\---



\## Defeito 1 – Correspondência apenas por prefixo (não parcial)



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm` (`text.startsWith(query)`)



\*\*Descrição do problema:\*\* A comparação usa `startsWith`, que só encontra textos que \*começam\* com o termo. Uma correspondência parcial deve encontrar o termo em qualquer posição do texto.



\*\*Comportamento esperado:\*\* Buscar `"prince"` deve retornar "O Pequeno Príncipe", e `"saint"` deve retornar livros de "Antoine de Saint-Exupéry". O termo pode aparecer em qualquer posição (`includes`).



\*\*Comportamento atual:\*\* Só retorna livros cujo título/autor começa com o termo. Buscas por trechos do meio ou do fim não retornam nada.



\*\*Requisito relacionado:\*\* RF03 / CA10 (correspondência parcial) e CA12 (todos os livros compatíveis devem ser retornados).



\---



\## Defeito 2 – Pesquisa não é case-insensitive de fato



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm`



\*\*Descrição do problema:\*\* Apenas o termo da pesquisa (`term`) é convertido para minúsculas. O texto do livro (`text`) é comparado sem normalização.



\*\*Comportamento esperado:\*\* Ambos os lados devem ser normalizados, de modo que `"dom casmurro"`, `"DOM CASMURRO"` e `"Dom Casmurro"` retornem o mesmo resultado.



\*\*Comportamento atual:\*\* Se o título é "Dom Casmurro" (com maiúsculas) e o usuário busca "dom", a comparação é `"Dom Casmurro".startsWith("dom")`, que resulta em `false`. Na prática, qualquer título/autor com letras maiúsculas deixa de ser encontrado, o que é o caso da maioria dos registros.



\*\*Requisito relacionado:\*\* CA11 (a pesquisa não deve diferenciar maiúsculas de minúsculas).



\---



\## Defeito 3 – Busca por autor só é executada se a busca por título não retornar nada



\*\*Localização:\*\* `src/books/book.service.js`, método `searchBooks`



```js

const books = byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term);

```



\*\*Descrição do problema:\*\* O requisito é pesquisar por título \*\*ou\*\* autor, ou seja, a união dos dois conjuntos. O código usa a busca por autor apenas como fallback quando não há resultados por título.



\*\*Comportamento esperado:\*\* Retornar todos os livros cujo título \*\*ou\*\* autor correspondam ao termo (união sem duplicatas).



\*\*Comportamento atual:\*\* Se ao menos um livro casar por título, os livros que casam apenas por autor são omitidos. Por exemplo, ao buscar "machado", um livro com "Machado" no título esconde todas as obras do autor Machado de Assis.



\*\*Requisito relacionado:\*\* RF03 e CA12 (todos os livros compatíveis devem ser retornados).



\---



\## Defeito 4 – Limite de 10 resultados



\*\*Localização:\*\* `src/books/book.service.js`, constante `MAX\_SEARCH\_RESULTS` e `books.slice(0, MAX\_SEARCH\_RESULTS)`



\*\*Descrição do problema:\*\* O resultado é truncado em 10 itens, sem que exista qualquer requisito de paginação ou limite.



\*\*Comportamento esperado:\*\* Retornar todos os livros compatíveis.



\*\*Comportamento atual:\*\* Em buscas com mais de 10 correspondências, os demais livros são descartados silenciosamente, sem indicação de truncamento.



\*\*Requisito relacionado:\*\* CA12 (todos os livros compatíveis devem ser retornados).



\---



\## Observação (ponto de atenção, não classificado como defeito confirmado)



Em `searchBooks`, se `q` não for informado (`undefined`), `isBlank` precisa tratar esse caso para não gerar erro; isso depende da implementação de `isBlank`, que não está no diff. Além disso, o lançamento de `INVALID\_SEARCH\_TERM` para termo vazio não é contradito pelos requisitos fornecidos, mas também não é previsto por eles; vale confirmar com a regra de negócio. O CA13 (lista vazia sem correspondência) é atendido pela implementação atual.

