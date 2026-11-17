Aqui estão os defeitos funcionais identificados no Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\*\*Defeito 1\*\*



\* \*\*localização:\*\* `src/books/book.service.js` (método `createBook`, linha `const existingBook = await this.bookRepository.findOne({ isbn, title });`)

\* \*\*descrição do problema:\*\* A verificação de duplicidade está exigindo a combinação exata de `isbn` e `title` para considerar que o livro já existe. Isso permite cadastrar múltiplos livros com o mesmo ISBN, desde que tenham títulos diferentes.

\* \*\*comportamento esperado:\*\* A busca para verificar a existência prévia de um livro deve considerar apenas o `isbn`.

\* \*\*comportamento atual:\*\* A busca considera `isbn` e `title`, falhando em detectar a duplicidade do ISBN caso o título seja diferente.

\* \*\*requisito relacionado:\*\* CA02 (O ISBN deve ser obrigatório e único).



\---



\*\*Defeito 2\*\*



\* \*\*localização:\*\* `src/books/book.service.js` (método `createBook`)

\* \*\*descrição do problema:\*\* O sistema salva o livro no repositório (`this.bookRepository.save(...)`) antes de executar as validações dos dados (campos em branco e quantidade total). Se uma dessas validações falhar, o erro é lançado, mas o registro já foi persistido indevidamente.

\* \*\*comportamento esperado:\*\* As validações devem ocorrer antes de qualquer operação que modifique o estado do banco de dados/repositório.

\* \*\*comportamento atual:\*\* O método altera os dados do acervo inserindo um registro possivelmente inválido e só depois executa as validações e rejeita a operação com erro.

\* \*\*requisito relacionado:\*\* CA05 (Um cadastro inválido deve ser rejeitado sem alterar o acervo) e RN08 (Uma operação rejeitada não pode modificar os dados do sistema).



\---



\*\*Defeito 3\*\*



\* \*\*localização:\*\* `src/books/book.service.js` (método `createBook`, linha `if (!totalCopies)`)

\* \*\*descrição do problema:\*\* A validação de quantidade está apenas verificando se a variável é um valor do tipo "falsy" (como `0`, `null` ou `undefined`). Valores negativos (como `-5`) são considerados "truthy" em JavaScript e vão passar indevidamente pela validação.

\* \*\*comportamento esperado:\*\* O sistema deve verificar explicitamente se o valor de `totalCopies` é um número maior que zero.

\* \*\*comportamento atual:\*\* A condição `!totalCopies` permite o cadastro de livros com quantidades negativas de exemplares.

\* \*\*requisito relacionado:\*\* CA04 (A quantidade total de exemplares deve ser maior que zero).



\---



\*\*Defeito 4\*\*



\* \*\*localização:\*\* `src/books/book.service.js` (método `createBook`, na chamada de `this.bookRepository.save`)

\* \*\*descrição do problema:\*\* A definição de `availableCopies` está utilizando o valor vindo do input do usuário, e usando `totalCopies` apenas como fallback (`input.availableCopies ?? totalCopies`). Isso permite que o cliente envie na requisição uma quantidade disponível diferente da quantidade total.

\* \*\*comportamento esperado:\*\* O sistema deve ignorar qualquer valor de `availableCopies` enviado no payload e sempre inicializá-lo com o valor exato de `totalCopies`.

\* \*\*comportamento atual:\*\* O sistema aceita a entrada `input.availableCopies` provida pelo usuário, burlando a regra de negócio caso enviada.

\* \*\*requisito relacionado:\*\* CA01 (Um livro válido deve ser armazenado com a quantidade disponível igual à quantidade total).

