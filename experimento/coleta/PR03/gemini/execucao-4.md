Análise do Pull Request finalizada. Foram identificados 4 defeitos funcionais que violam os requisitos especificados.



\---



\### Defeito 1: Busca restrita apenas ao início do texto



\* \*\*Localização:\*\* `src/books/book.repository.js` (função `matchesTerm`)

\* \*\*Descrição do problema:\*\* A função utiliza `text.startsWith(query)`, o que aceita correspondência apenas se o texto começar com o termo pesquisado.

\* \*\*Comportamento esperado:\*\* A pesquisa deve aceitar correspondência parcial em qualquer posição da string (ex.: buscar "Casmurro" deve encontrar "Dom Casmurro").

\* \*\*Comportamento atual:\*\* Somente livros cujo título ou autor iniciam exatamente com o termo digitado são retornados.

\* \*\*Requisito relacionado:\*\* CA10 (A pesquisa deve aceitar correspondência parcial).



\---



\### Defeito 2: Sensibilidade a letras maiúsculas e minúsculas no texto de origem



\* \*\*Localização:\*\* `src/books/book.repository.js` (função `matchesTerm`)

\* \*\*Descrição do problema:\*\* O termo de busca (`term`) é convertido para letras minúsculas (`term.toLowerCase()`), porém a propriedade do livro (`text`) permanece no formato original durante a comparação.

\* \*\*Comportamento esperado:\*\* A busca não deve diferenciar letras maiúsculas e minúsculas, ignorando o case tanto da busca quanto dos dados armazenados (ex.: buscar "dom" deve encontrar "Dom Casmurro").

\* \*\*Comportamento atual:\*\* A comparação falha quando o texto do livro possui caracteres em caixa alta (ex.: `"Dom Casmurro".startsWith("dom")` retorna `false`).

\* \*\*Requisito relacionado:\*\* CA11 (A pesquisa não deve diferenciar letras maiúsculas e minúsculas).



\---



\### Defeito 3: Omissão de livros correspondentes por autor quando há correspondência por título



\* \*\*Localização:\*\* `src/books/book.service.js` (método `searchBooks`)

\* \*\*Descrição do problema:\*\* O código executa a busca por autor de forma mutuamente exclusiva com a busca por título (`byTitle.length > 0 ? byTitle : await this.bookRepository.searchByAuthor(term)`).

\* \*\*Comportamento esperado:\*\* O sistema deve consultar e combinar os resultados de título e autor, garantindo que livros que coincidam em qualquer um dos dois campos sejam retornados.

\* \*\*Comportamento atual:\*\* Se houver ao menos um livro cujo título coincida com o termo, a busca por autor é completamente ignorada, omitindo livros cujo autor coincida com o termo.

\* \*\*Requisito relacionado:\*\* RF03 (O sistema deve permitir a pesquisa de livros por título ou autor) e CA12 (Todos os livros compatíveis devem ser retornados).



\---



\### Defeito 4: Limitação arbitrária da quantidade de resultados



\* \*\*Localização:\*\* `src/books/book.service.js` (constante `MAX\_SEARCH\_RESULTS` e método `searchBooks`)

\* \*\*Descrição do problema:\*\* O retorno da busca é limitado aos primeiros 10 itens através da instrução `books.slice(0, MAX\_SEARCH\_RESULTS)`.

\* \*\*Comportamento esperado:\*\* Todos os livros compatíveis com os critérios de busca devem ser retornados na resposta sem limite de quantidade.

\* \*\*Comportamento atual:\*\* Se houver mais de 10 livros compatíveis, apenas os 10 primeiros são retornados.

\* \*\*Requisito relacionado:\*\* CA12 (Todos os livros compatíveis devem ser retornados).

