Aqui estão os defeitos funcionais identificados no Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\### Defeito 1: Validação de unicidade do ISBN incorreta



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, linha `const existingBook = await this.bookRepository.findOne({ isbn, title });`

\* \*\*Descrição do problema:\*\* A busca para verificar se o ISBN já existe está exigindo que o `isbn` e o `title` sejam iguais aos do banco de dados. Se o usuário enviar um ISBN já existente, mas informar um título diferente, o sistema não encontrará o registro e permitirá a duplicação do ISBN.

\* \*\*Comportamento esperado:\*\* A verificação de unicidade deve buscar no repositório exclusivamente pelo campo `isbn`.

\* \*\*Comportamento atual:\*\* O sistema busca por `isbn` e `title` simultaneamente, permitindo o cadastro de ISBNs duplicados desde que tenham títulos diferentes.

\* \*\*Requisito relacionado:\*\* CA02 (O ISBN deve ser obrigatório e único).



\### Defeito 2: Alteração de dados antes da validação



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`

\* \*\*Descrição do problema:\*\* O livro é salvo no banco de dados (`this.bookRepository.save(...)`) \*antes\* de as regras de validação (campos vazios e quantidade de cópias) serem executadas.

\* \*\*Comportamento esperado:\*\* O sistema deve validar todos os dados de entrada primeiro. Apenas se todos os dados forem válidos o registro deve ser salvo no acervo.

\* \*\*Comportamento atual:\*\* O sistema salva o livro no acervo e, se houver erro de validação logo em seguida, a exceção é lançada, mas o livro inválido já foi persistido, deixando o sistema em estado inconsistente.

\* \*\*Requisito relacionado:\*\* CA05 (Um cadastro inválido deve ser rejeitado sem alterar o acervo) e RN08 (Uma operação rejeitada não pode modificar os dados do sistema).



\### Defeito 3: Quantidade total aceita valores negativos



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, bloco `if (!totalCopies) { ... }`

\* \*\*Descrição do problema:\*\* A expressão `!totalCopies` rejeita apenas valores "falsy" (como `0`, `null` ou `undefined`). Como números negativos (ex: `-5`) são considerados valores "truthy" no JavaScript, a validação não os bloqueia.

\* \*\*Comportamento esperado:\*\* O sistema deve garantir que o valor passado para `totalCopies` seja estritamente maior que zero (ex: `totalCopies > 0`).

\* \*\*Comportamento atual:\*\* O sistema permite que um livro seja cadastrado com uma quantidade total negativa.

\* \*\*Requisito relacionado:\*\* CA04 (A quantidade total de exemplares deve ser maior que zero).



\### Defeito 4: Permissão para burlar a regra de quantidade disponível



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, na montagem do objeto salvo: `availableCopies: input.availableCopies ?? totalCopies`

\* \*\*Descrição do problema:\*\* O código permite que o cliente envie explicitamente um valor para `availableCopies` no payload da requisição, o que sobrescreve a regra padrão de igualar as cópias disponíveis às cópias totais no momento do cadastro.

\* \*\*Comportamento esperado:\*\* Ao cadastrar um novo livro, a quantidade disponível deve ser obrigatoriamente igual à quantidade total recebida, ignorando qualquer valor de `availableCopies` enviado na requisição.

\* \*\*Comportamento atual:\*\* Se o usuário enviar no payload `totalCopies: 10` e `availableCopies: 2`, o sistema acatará o valor de `availableCopies`, violando a regra de inicialização do livro.

\* \*\*Requisito relacionado:\*\* CA01 (Um livro válido deve ser armazenado com a quantidade disponível igual à quantidade total).

