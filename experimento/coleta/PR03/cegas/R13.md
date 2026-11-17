\# Revisão do Pull Request: RF03 – Consultar acervo



Encontrei \*\*4 defeitos funcionais\*\*.



\---



\## Defeito 1 — Correspondência apenas por prefixo (não parcial)



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm`



```js

return text.startsWith(query);

```



\- \*\*Descrição:\*\* a comparação usa `startsWith`, o que só encontra termos no início do texto. Um termo no meio ou no fim do título/autor não é encontrado.

\- \*\*Comportamento esperado:\*\* qualquer ocorrência do termo dentro do título ou do autor deve casar (ex.: `"prince"` encontra "O Pequeno Príncipe"; `"silva"` encontra "Maria Silva").

\- \*\*Comportamento atual:\*\* só casa se o texto \*começar\* com o termo. Os livros acima não seriam retornados.

\- \*\*Requisito relacionado:\*\* CA10 (correspondência parcial) e CA12 (todos os livros compatíveis).



\---



\## Defeito 2 — Busca não ignora maiúsculas/minúsculas (apenas o termo é normalizado)



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm`



```js

const query = term.toLowerCase();

return text.startsWith(query);

```



\- \*\*Descrição:\*\* apenas o termo pesquisado é convertido para minúsculas; o texto do livro (`title`/`author`) não é normalizado.

\- \*\*Comportamento esperado:\*\* `"dom casmurro"`, `"DOM CASMURRO"` e `"Dom Casmurro"` devem retornar o mesmo resultado.

\- \*\*Comportamento atual:\*\* como o termo vira minúsculo e o título continua como cadastrado (ex.: "Dom Casmurro"), a comparação falha sempre que o texto armazenado tiver qualquer letra maiúscula, o que é o caso típico de títulos e nomes de autores. Pesquisar "dom" não encontra "Dom Casmurro".

\- \*\*Requisito relacionado:\*\* CA11 (não diferenciar maiúsculas e minúsculas).



\---



\## Defeito 3 — Busca por autor só é executada se a busca por título não retornar nada



\*\*Localização:\*\* `src/books/book.service.js`, método `searchBooks`



```js

const byTitle = await this.bookRepository.searchByTitle(term);

const books = byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term);

```



\- \*\*Descrição:\*\* os resultados por autor são descartados sempre que existir pelo menos um resultado por título. Não há união dos dois conjuntos.

\- \*\*Comportamento esperado:\*\* retornar todos os livros cujo título \*\*ou\*\* autor correspondam ao termo (ex.: pesquisar "Machado" deve trazer tanto um livro com "Machado" no título quanto os livros do autor Machado de Assis).

\- \*\*Comportamento atual:\*\* se algum título casar, livros compatíveis apenas pelo autor ficam de fora.

\- \*\*Requisito relacionado:\*\* RF03 (pesquisa por título \*\*ou\*\* autor) e CA12.



\---



\## Defeito 4 — Limite arbitrário de 10 resultados



\*\*Localização:\*\* `src/books/book.service.js`, constante `MAX\_SEARCH\_RESULTS` e `books.slice(0, MAX\_SEARCH\_RESULTS)`



\- \*\*Descrição:\*\* o resultado é truncado em 10 itens, sem previsão nos requisitos (e sem paginação ou indicação ao cliente).

\- \*\*Comportamento esperado:\*\* todos os livros compatíveis devem ser retornados.

\- \*\*Comportamento atual:\*\* se houver mais de 10 correspondências, apenas as 10 primeiras são devolvidas, sem aviso.

\- \*\*Requisito relacionado:\*\* CA12 (todos os livros compatíveis devem ser retornados).



\---



\## Pontos verificados e sem defeito



\- \*\*CA13:\*\* quando nada casa, `filter` retorna `\[]` e o `slice` mantém a lista vazia. Está correto.

\- \*\*Rota `/search`:\*\* é registrada como rota própria, sem conflito evidente com a listagem.



\## Observação (a confirmar, fora dos defeitos acima)



A validação `isBlank(term)` lança `INVALID\_SEARCH\_TERM`. Os requisitos fornecidos não definem o comportamento para termo vazio ou ausente, então não classifiquei como defeito. Vale confirmar se esse erro está previsto em outro requisito e se o `AppError` é mapeado para um status HTTP adequado (como 400) no tratamento de erros da aplicação.

