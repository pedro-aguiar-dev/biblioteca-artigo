\# Revisão do Pull Request: RF03 (Consultar acervo)



Encontrei \*\*4 defeitos funcionais\*\*, todos ligados aos critérios de aceitação da pesquisa.



\---



\## Defeito 1: Correspondência apenas por prefixo



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm` (`text.startsWith(query)`)



\*\*Descrição do problema:\*\* A comparação usa `startsWith`, então só encontra livros cujo título ou autor \*começa\* com o termo digitado.



\*\*Comportamento esperado:\*\* Correspondência parcial em qualquer posição do texto. Buscar "ring" deve encontrar "O Senhor dos Anéis: The Lord of the Rings".



\*\*Comportamento atual:\*\* Buscar "senhor" não encontra "O Senhor dos Anéis", e buscar "tolkien" não encontra "J. R. R. Tolkien", pois o termo não está no início do texto.



\*\*Requisito relacionado:\*\* CA10 (a pesquisa deve aceitar correspondência parcial).



\---



\## Defeito 2: Texto do livro não é normalizado para minúsculas



\*\*Localização:\*\* `src/books/book.repository.js`, função `matchesTerm` (apenas `term` passa por `toLowerCase()`)



\*\*Descrição do problema:\*\* O termo de busca é convertido para minúsculas, mas `text` (título ou autor) é comparado como está armazenado.



\*\*Comportamento esperado:\*\* Buscas sem distinção entre maiúsculas e minúsculas. "dom casmurro", "DOM CASMURRO" e "Dom Casmurro" devem retornar o mesmo resultado.



\*\*Comportamento atual:\*\* Qualquer título ou autor que contenha letras maiúsculas nunca corresponde a um termo convertido para minúsculas. Por exemplo, buscar "Dom" vira "dom" e não casa com "Dom Casmurro". Na prática, quase todo livro com inicial maiúscula fica fora dos resultados.



\*\*Requisito relacionado:\*\* CA11 (a pesquisa não deve diferenciar maiúsculas de minúsculas).



\---



\## Defeito 3: Autor só é pesquisado se a busca por título não retornar nada



\*\*Localização:\*\* `src/books/book.service.js`, método `searchBooks` (`byTitle.length > 0 ? byTitle : await ...searchByAuthor(term)`)



\*\*Descrição do problema:\*\* A busca por autor funciona como fallback. Se existir qualquer correspondência por título, os livros cujo autor corresponde ao termo são descartados. Também não há união nem remoção de duplicados dos dois conjuntos.



\*\*Comportamento esperado:\*\* Retornar a união (sem duplicatas) dos livros cujo título \*\*ou\*\* autor correspondem ao termo.



\*\*Comportamento atual:\*\* Se o termo "machado" casar com o título de um livro, os livros de Machado de Assis cujo título não contém o termo não são retornados.



\*\*Requisito relacionado:\*\* RF03 (pesquisa por título \*ou\* autor) e CA12 (todos os livros compatíveis devem ser retornados).



\---



\## Defeito 4: Resultados limitados a 10 itens



\*\*Localização:\*\* `src/books/book.service.js`, constante `MAX\_SEARCH\_RESULTS = 10` e `books.slice(0, MAX\_SEARCH\_RESULTS)`



\*\*Descrição do problema:\*\* O resultado é truncado em 10 livros, limite que não existe nos requisitos.



\*\*Comportamento esperado:\*\* Todos os livros compatíveis com o termo devem ser retornados.



\*\*Comportamento atual:\*\* Se 25 livros correspondem à busca, apenas os 10 primeiros são retornados e os demais ficam omitidos, sem qualquer indicação de truncamento.



\*\*Requisito relacionado:\*\* CA12 (todos os livros compatíveis devem ser retornados).



\---



\## Verificações sem defeito



\- \*\*CA13 (lista vazia sem correspondência):\*\* o fluxo retorna `\[]` quando nada casa, o que atende ao critério.

\- \*\*Validação de termo vazio (`INVALID\_SEARCH\_TERM`):\*\* não contradiz nenhum requisito listado. Ela não está especificada, mas também não viola os critérios fornecidos, então não a reporto como defeito.

