\# Revisão do Pull Request: RF03 – Consultar acervo



Encontrei \*\*4 defeitos funcionais\*\*.



\---



\## Defeito 1: Correspondência apenas por prefixo, não parcial



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm` (`text.startsWith(query)`)



\*\*Descrição do problema:\*\* A comparação usa `startsWith`, então só encontra textos que \*começam\* com o termo pesquisado.



\*\*Comportamento esperado:\*\* O termo pode aparecer em qualquer posição do título ou do autor. Pesquisar "prince" deve encontrar "O Pequeno Príncipe", e "saint" deve encontrar "Antoine de Saint-Exupéry".



\*\*Comportamento atual:\*\* Só retorna livros cujo título/autor começa com o termo. Termos que aparecem no meio ou no fim do texto não retornam nada.



\*\*Requisito relacionado:\*\* RF03 / CA10 (correspondência parcial) e CA12 (todos os livros compatíveis).



\---



\## Defeito 2: Comparação sensível a maiúsculas/minúsculas



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm`



\*\*Descrição do problema:\*\* Apenas o termo da pesquisa (`term`) é convertido para minúsculas. O texto do livro (`text`) é comparado como está armazenado.



\*\*Comportamento esperado:\*\* A pesquisa ignora a diferença entre maiúsculas e minúsculas nos dois lados. "dom casmurro" deve encontrar "Dom Casmurro".



\*\*Comportamento atual:\*\* Como o termo vira minúsculo e o título continua com a capitalização original ("Dom Casmurro"), `"Dom Casmurro".startsWith("dom casmurro")` é `false`. Qualquer título ou autor com letra maiúscula (a maioria) deixa de ser encontrado, mesmo com o termo digitado de forma idêntica.



\*\*Requisito relacionado:\*\* CA11 (não diferenciar maiúsculas e minúsculas).



\---



\## Defeito 3: Busca por autor só é feita se a busca por título não retornar nada



\*\*Localização:\*\* `src/books/book.service.js`, método `searchBooks`



```js

const books = byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term);

```



\*\*Descrição do problema:\*\* Os resultados por autor só são consultados quando não há nenhum resultado por título. Os dois conjuntos não são combinados.



\*\*Comportamento esperado:\*\* Retornar a união dos livros que casam por título \*\*ou\*\* por autor, sem duplicatas. Se "Machado" aparece no título de um livro e é autor de outros, todos devem ser retornados.



\*\*Comportamento atual:\*\* Se ao menos um livro casar por título, os livros que casam apenas por autor são omitidos.



\*\*Requisito relacionado:\*\* RF03 (pesquisa por título \*\*ou\*\* autor) e CA12.



\---



\## Defeito 4: Limite arbitrário de 10 resultados



\*\*Localização:\*\* `src/books/book.service.js`, constante `MAX\_SEARCH\_RESULTS` e `books.slice(0, MAX\_SEARCH\_RESULTS)`



\*\*Descrição do problema:\*\* O resultado é truncado em 10 itens, sem previsão nos requisitos e sem paginação.



\*\*Comportamento esperado:\*\* Todos os livros compatíveis com a pesquisa são retornados.



\*\*Comportamento atual:\*\* Se mais de 10 livros casarem, apenas os 10 primeiros são retornados, sem indicação de truncamento.



\*\*Requisito relacionado:\*\* CA12 (todos os livros compatíveis devem ser retornados).



\---



\## Observações adicionais (não classificadas como defeito)



\- \*\*Termo ausente ou em branco:\*\* `searchBooks` lança `INVALID\_SEARCH\_TERM` quando `q` está vazio. Os requisitos não definem esse caso, então não é violação direta. Vale confirmar com o time se o comportamento é intencional. Se `q` não for string (por exemplo, `?q=a\&q=b` gera um array), `isBlank` e `toLowerCase` podem falhar, mas isso depende de como `isBlank` trata o valor, e ela não aparece completa no diff.

\- \*\*CA13 (lista vazia sem correspondência):\*\* o código atende, pois `filter` retorna `\[]` e `slice` mantém a lista vazia.

