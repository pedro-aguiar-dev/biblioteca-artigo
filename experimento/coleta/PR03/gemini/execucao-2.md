Com base na análise do código fornecido e dos requisitos de negócio (RF03 e seus critérios de aceitação), foram identificados os seguintes defeitos funcionais:



\### Defeito 1



\* \*\*Localização:\*\* `src/books/book.repository.js` - Função `matchesTerm`.

\* \*\*Descrição do problema:\*\* A função utiliza o método `startsWith` para verificar a correspondência. Isso faz com que a pesquisa funcione apenas para prefixos (termos que estão no exato início da string), falhando caso o termo buscado esteja no meio ou no fim do título/autor.

\* \*\*Comportamento esperado:\*\* A pesquisa deve aceitar correspondência parcial em qualquer parte do texto.

\* \*\*Comportamento atual:\*\* A pesquisa só retorna resultados se o texto começar exatamente com o termo da busca.

\* \*\*Requisito relacionado:\*\* CA10 (A pesquisa deve aceitar correspondência parcial).



\### Defeito 2



\* \*\*Localização:\*\* `src/books/book.repository.js` - Função `matchesTerm`.

\* \*\*Descrição do problema:\*\* O parâmetro `term` é convertido para minúsculas (`term.toLowerCase()`), mas o texto armazenado no livro (`text`) não é convertido antes da comparação. Isso fará com que o `startsWith` falhe caso o título ou autor original no banco de dados possua letras maiúsculas (ex: comparar `"Harry Potter"` com `"harry"` retornará falso).

\* \*\*Comportamento esperado:\*\* A pesquisa não deve diferenciar letras maiúsculas e minúsculas (case-insensitive).

\* \*\*Comportamento atual:\*\* A pesquisa é sensível a letras maiúsculas no texto original, não encontrando resultados válidos.

\* \*\*Requisito relacionado:\*\* CA11 (A pesquisa não deve diferenciar letras maiúsculas e minúsculas).



\### Defeito 3



\* \*\*Localização:\*\* `src/books/book.service.js` - Método `searchBooks`.

\* \*\*Descrição do problema:\*\* A lógica utilizada avalia os resultados de forma excludente (`byTitle.length > 0 ? byTitle : ...`). Se o termo de pesquisa encontrar resultados compatíveis no \*\*título\*\*, o sistema ignora completamente a busca por \*\*autor\*\*. Isso impede que o retorno contenha a combinação de ambos (ex: uma busca por um termo que é nome de um autor em um livro e parte do título em outro).

\* \*\*Comportamento esperado:\*\* O sistema deve buscar as correspondências em títulos E autores, unificando os resultados para retornar todos os livros compatíveis.

\* \*\*Comportamento atual:\*\* Se houver ao menos um livro cujo título corresponda ao termo, os livros correspondentes pelo nome do autor são suprimidos da resposta.

\* \*\*Requisito relacionado:\*\* RF03 (pesquisa de livros por título ou autor) e CA12 (Todos os livros compatíveis devem ser retornados).



\### Defeito 4



\* \*\*Localização:\*\* `src/books/book.service.js` - Método `searchBooks`.

\* \*\*Descrição do problema:\*\* A constante `MAX\_SEARCH\_RESULTS` em conjunto com o método `.slice(0, MAX\_SEARCH\_RESULTS)` trunca arbitrariamente o retorno em um máximo de 10 itens.

\* \*\*Comportamento esperado:\*\* Todos os livros que corresponderem à pesquisa devem ser retornados na listagem, sem paginação ou limite artificial definido neste escopo.

\* \*\*Comportamento atual:\*\* Se houver 11 ou mais livros correspondentes na base de dados, a pesquisa esconderá os resultados além do 10º.

\* \*\*Requisito relacionado:\*\* CA12 (Todos os livros compatíveis devem ser retornados).

