Aqui estão os defeitos funcionais identificados na revisão do Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/books/book.repository.js`, na função `matchesTerm`.

\* \*\*Descrição do problema:\*\* A função converte apenas o termo de pesquisa (`term`) para letras minúsculas, mas não faz o mesmo com o texto do livro (`text`). A comparação acaba sendo sensível a letras maiúsculas/minúsculas.

\* \*\*Comportamento esperado:\*\* A pesquisa não deve diferenciar letras maiúsculas e minúsculas ao comparar o termo com o título ou autor.

\* \*\*Comportamento atual:\*\* A comparação de um texto que contenha letras maiúsculas com um termo convertido para minúsculas falhará (retornará falso).

\* \*\*Requisito relacionado:\*\* CA11 (A pesquisa não deve diferenciar letras maiúsculas e minúsculas).



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/books/book.repository.js`, na função `matchesTerm`.

\* \*\*Descrição do problema:\*\* A função utiliza o método `startsWith()`, o que restringe a correspondência apenas ao início do texto, não caracterizando uma busca parcial completa no meio ou fim da string.

\* \*\*Comportamento esperado:\*\* A pesquisa deve aceitar correspondência parcial em qualquer parte do texto do título ou autor (ex: usar `includes()`).

\* \*\*Comportamento atual:\*\* A pesquisa só encontra correspondência se o título ou autor começar exatamente com o termo buscado.

\* \*\*Requisito relacionado:\*\* CA10 (A pesquisa deve aceitar correspondência parcial).



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, na função `searchBooks`.

\* \*\*Descrição do problema:\*\* A lógica implementada faz com que a pesquisa por autor só seja executada caso a pesquisa por título não retorne nenhum resultado (`byTitle.length > 0 ? byTitle : await ...`).

\* \*\*Comportamento esperado:\*\* A pesquisa deve buscar por correspondências tanto no título quanto no autor simultaneamente, unificando os resultados para abranger todos os livros compatíveis.

\* \*\*Comportamento atual:\*\* Se houver pelo menos um livro cujo título corresponda ao termo, o sistema ignora e não retorna livros cujo autor também corresponda ao mesmo termo.

\* \*\*Requisito relacionado:\*\* RF03 (pesquisa de livros por título ou autor) e CA12 (Todos os livros compatíveis devem ser retornados).



\*\*Defeito 4\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, na função `searchBooks` e na constante `MAX\_SEARCH\_RESULTS`.

\* \*\*Descrição do problema:\*\* A função limita a quantidade de resultados retornados a um máximo de 10 itens utilizando `books.slice(0, MAX\_SEARCH\_RESULTS)`.

\* \*\*Comportamento esperado:\*\* O sistema deve retornar a lista com todos os livros que sejam compatíveis com a pesquisa, sem limite máximo de resultados.

\* \*\*Comportamento atual:\*\* Apenas os 10 primeiros livros encontrados são retornados, ocultando possíveis outros livros que correspondam à busca.

\* \*\*Requisito relacionado:\*\* CA12 (Todos os livros compatíveis devem ser retornados).

