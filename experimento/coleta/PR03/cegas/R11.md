Foram identificados os seguintes defeitos funcionais no Pull Request:



\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/books/book.repository.js` (função `matchesTerm`)

\* \*\*Descrição do problema:\*\* A comparação não lida corretamente com a diferença entre maiúsculas e minúsculas no texto alvo da busca.

\* \*\*Comportamento esperado:\*\* A pesquisa não deve diferenciar letras maiúsculas e minúsculas em momento algum.

\* \*\*Comportamento atual:\*\* Apenas o termo pesquisado (`term`) é convertido para minúsculas. O texto original do livro (`text`) não é convertido, o que faz a comparação falhar se o livro tiver letras maiúsculas (ex: pesquisar "senhor" não encontrará "Senhor dos Anéis").

\* \*\*Requisito relacionado:\*\* CA11 A pesquisa não deve diferenciar letras maiúsculas e minúsculas.



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/books/book.repository.js` (função `matchesTerm`)

\* \*\*Descrição do problema:\*\* A lógica restringe a busca apenas ao início do texto, ignorando ocorrências no meio do conteúdo.

\* \*\*Comportamento esperado:\*\* A pesquisa deve aceitar correspondência parcial (em qualquer lugar da string de título ou autor).

\* \*\*Comportamento atual:\*\* O código utiliza o método `text.startsWith(query)`, que avalia apenas se o título/autor começa com o termo pesquisado, rejeitando correspondências contidas no meio da string.

\* \*\*Requisito relacionado:\*\* CA10 A pesquisa deve aceitar correspondência parcial.



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/books/book.service.js` (método `searchBooks`)

\* \*\*Descrição do problema:\*\* A busca por autor é completamente ignorada se a busca por título retornar algum resultado.

\* \*\*Comportamento esperado:\*\* A pesquisa deve retornar todos os livros cujo título OU autor correspondam ao termo pesquisado de forma agregada.

\* \*\*Comportamento atual:\*\* O código utiliza um operador ternário (`byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term)`). Se achar algo pelo título, ele retorna exclusivamente os resultados de título, ignorando livros que também poderiam corresponder pelo autor.

\* \*\*Requisito relacionado:\*\* RF03 (pesquisa de livros por título ou autor) e CA12 (Todos os livros compatíveis devem ser retornados).



\*\*Defeito 4\*\*



\* \*\*Localização:\*\* `src/books/book.service.js` (método `searchBooks`)

\* \*\*Descrição do problema:\*\* Os resultados compatíveis estão sendo truncados por um limite rígido.

\* \*\*Comportamento esperado:\*\* Todos os livros que correspondem à pesquisa devem ser incluídos na lista de retorno.

\* \*\*Comportamento atual:\*\* O retorno está fatiando a lista com `slice(0, MAX\_SEARCH\_RESULTS)`, limitando os resultados a no máximo 10 livros, omitindo sumariamente quaisquer outros livros que também correspondam à pesquisa.

\* \*\*Requisito relacionado:\*\* CA12 Todos os livros compatíveis devem ser retornados.

