Aqui estão os defeitos funcionais identificados no Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\### Defeito 1: Validação incorreta de unicidade do ISBN



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook` (linha `const existingBook = await this.bookRepository.findOne({ isbn, title });`).

\* \*\*Descrição do problema:\*\* A busca por um livro existente está combinando os campos `isbn` e `title`.

\* \*\*Comportamento esperado:\*\* A verificação de unicidade deve ser feita exclusivamente pelo ISBN, independentemente do título do livro.

\* \*\*Comportamento atual:\*\* O sistema permite cadastrar dois livros com o mesmo ISBN (duplicidade), desde que os títulos enviados sejam diferentes.

\* \*\*Requisito relacionado:\*\* CA02 (O ISBN deve ser obrigatório e único).



\### Defeito 2: Alteração do estado do sistema antes da validação



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook` (as regras de validação ocorrem após `this.bookRepository.save`).

\* \*\*Descrição do problema:\*\* As checagens de campos obrigatórios (`isBlank`) e quantidade ocorrem depois que a operação de salvamento no repositório já foi executada.

\* \*\*Comportamento esperado:\*\* A validação deve ocorrer antes de persistir os dados. Uma operação inválida deve ser rejeitada sem alterar o acervo.

\* \*\*Comportamento atual:\*\* Um livro com dados inválidos é armazenado no array (modificando o acervo) e somente depois o erro é lançado, deixando o sistema com dados inconsistentes.

\* \*\*Requisito relacionado:\*\* CA05 e RN08 (Uma operação rejeitada não pode modificar os dados do sistema).



\### Defeito 3: Quantidade total permite valores negativos



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook` (linha `if (!totalCopies) { throw new AppError("INVALID\_QUANTITY"); }`).

\* \*\*Descrição do problema:\*\* A validação `!totalCopies` verifica apenas se o valor é \*falsy\* (zero, `null` ou `undefined`), falhando em capturar números negativos.

\* \*\*Comportamento esperado:\*\* A quantidade total de exemplares deve ser validada para garantir que seja um valor estritamente maior que zero (ex: `totalCopies <= 0`).

\* \*\*Comportamento atual:\*\* O sistema aceita cadastrar uma quantidade total negativa (ex: `-5`), pois o valor é avaliado como \*truthy\* em JavaScript e passa pela validação.

\* \*\*Requisito relacionado:\*\* CA04 (A quantidade total de exemplares deve ser maior que zero) e RN09.



\### Defeito 4: Quantidade disponível pode ser manipulada no cadastro



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, durante a criação do objeto (linha `availableCopies: input.availableCopies ?? totalCopies`).

\* \*\*Descrição do problema:\*\* O sistema permite que o atributo `availableCopies` seja definido a partir da entrada do usuário (`input`).

\* \*\*Comportamento esperado:\*\* No cadastro, a quantidade disponível deve ser forçosamente definida como igual à quantidade total recebida, ignorando qualquer valor de cópias disponíveis enviado pelo usuário.

\* \*\*Comportamento atual:\*\* Se o usuário enviar um valor arbitrário para `availableCopies` na requisição (por exemplo, divergente de `totalCopies`), o sistema usará esse valor e violará a integridade do cadastro.

\* \*\*Requisito relacionado:\*\* CA01 (Um livro válido deve ser armazenado com a quantidade disponível igual à quantidade total).

