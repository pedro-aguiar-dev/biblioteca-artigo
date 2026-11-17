Aqui estão os defeitos funcionais encontrados no Pull Request:



\*\*1. Verificação incorreta da unicidade do ISBN\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, na linha `const existingBook = await this.bookRepository.findOne({ isbn, title });`.

\* \*\*Descrição do problema:\*\* A busca de verificação de duplicidade está filtrando livros que tenham, simultaneamente, o mesmo ISBN e o mesmo título.

\* \*\*Comportamento esperado:\*\* O ISBN deve ser único no sistema de forma absoluta.

\* \*\*Comportamento atual:\*\* O sistema permite cadastrar um livro com um ISBN que já existe, desde que o título seja diferente do livro previamente cadastrado com aquele ISBN.

\* \*\*Requisito relacionado:\*\* CA02.



\*\*2. Persistência de dados antes da validação\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, onde `this.bookRepository.save(...)` é chamado antes das condicionais que lançam erro (`isBlank(isbn)...` e `!totalCopies`).

\* \*\*Descrição do problema:\*\* O livro está sendo salvo no repositório em memória antes que a validação dos campos (título, autor, ISBN e quantidade) aconteça. Se os dados forem inválidos, a exceção será lançada, porém o livro já terá sido inserido no array do repositório.

\* \*\*Comportamento esperado:\*\* Um cadastro inválido deve ser rejeitado sem modificar o acervo ou a base de dados do sistema.

\* \*\*Comportamento atual:\*\* Livros com dados inválidos (em branco ou com quantidade vazia) são salvos no repositório antes de a requisição ser interrompida.

\* \*\*Requisito relacionado:\*\* CA05 e RN08.



\*\*3. Validação fraca para a quantidade total de exemplares\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, na condicional `if (!totalCopies)`.

\* \*\*Descrição do problema:\*\* A expressão `!totalCopies` falha apenas para valores \*falsy\* (como `0`, `null`, `undefined`), mas não impede valores numéricos negativos, já que números negativos são avaliados como \*truthy\* em JavaScript.

\* \*\*Comportamento esperado:\*\* A quantidade total de exemplares deve ser obrigatoriamente um valor numérico maior que zero.

\* \*\*Comportamento atual:\*\* O sistema aceita o cadastro de livros informando quantidades totais negativas (ex: `-5`).

\* \*\*Requisito relacionado:\*\* CA04.



\*\*4. Permissão para enviar quantidade disponível na criação\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, na propriedade `availableCopies: input.availableCopies ?? totalCopies` passada ao salvar o livro.

\* \*\*Descrição do problema:\*\* O código permite que o usuário da API envie no \*payload\* (corpo da requisição) o campo `availableCopies` (quantidade disponível) com um valor diferente de `totalCopies`.

\* \*\*Comportamento esperado:\*\* No momento do cadastro, o livro deve ser armazenado garantindo-se que a quantidade disponível seja sempre exatamente igual à quantidade total estipulada.

\* \*\*Comportamento atual:\*\* O sistema acata e armazena o valor de `availableCopies` se ele for enviado na requisição, permitindo a criação de um livro já com divergência entre a quantidade total e disponível.

\* \*\*Requisito relacionado:\*\* CA01.

