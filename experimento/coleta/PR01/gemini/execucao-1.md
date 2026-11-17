Aqui estão os defeitos funcionais identificados no Pull Request, com base nos requisitos e regras de negócio fornecidos:



\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`.

\* \*\*Descrição do problema:\*\* A verificação de duplicidade de ISBN está considerando a combinação de `isbn` e `title` (`findOne({ isbn, title })`).

\* \*\*Comportamento esperado:\*\* A validação de unicidade deve verificar no repositório exclusivamente se o `isbn` já existe, independentemente de outros atributos.

\* \*\*Comportamento atual:\*\* O sistema permite cadastrar dois livros com o mesmo ISBN, desde que tenham títulos diferentes, não acusando o conflito.

\* \*\*Requisito relacionado:\*\* CA02 O ISBN deve ser obrigatório e único.



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`.

\* \*\*Descrição do problema:\*\* A instrução para salvar o livro no repositório (`this.bookRepository.save(...)`) está ocorrendo \*antes\* das validações de campos obrigatórios (ISBN, título, autor) e de quantidade.

\* \*\*Comportamento esperado:\*\* O sistema deve validar todos os dados primeiro e salvar no banco de dados apenas se todas as validações passarem.

\* \*\*Comportamento atual:\*\* Mesmo que o cadastro seja inválido e lance um erro (`INVALID\_BOOK` ou `INVALID\_QUANTITY`), o livro já terá sido persistido na memória (`#books`), poluindo o acervo.

\* \*\*Requisito relacionado:\*\* CA05 Um cadastro inválido deve ser rejeitado sem alterar o acervo / RN08 Uma operação rejeitada não pode modificar os dados do sistema.



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`.

\* \*\*Descrição do problema:\*\* A validação da quantidade total (`if (!totalCopies)`) avalia apenas se o valor é \*falsy\* (como 0, `null` ou `undefined`), o que não impede números negativos.

\* \*\*Comportamento esperado:\*\* O sistema deve garantir que o valor passado para a quantidade total seja estritamente maior que zero (ex: `totalCopies > 0`).

\* \*\*Comportamento atual:\*\* O sistema permite a criação de um livro com quantidade total de exemplares negativa (por exemplo, `-5`), pois o valor negativo é avaliado como verdadeiro e burla o `if`.

\* \*\*Requisito relacionado:\*\* CA04 A quantidade total de exemplares deve ser maior que zero.



\*\*Defeito 4\*\*



\* \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, no objeto passado para `this.bookRepository.save(...)`.

\* \*\*Descrição do problema:\*\* A definição de exemplares disponíveis está aceitando valores externos (`availableCopies: input.availableCopies ?? totalCopies`).

\* \*\*Comportamento esperado:\*\* No momento do cadastro, o sistema deve forçar que a quantidade de exemplares disponíveis seja obrigatoriamente igual à quantidade total informada, ignorando qualquer valor de `availableCopies` que venha no corpo da requisição.

\* \*\*Comportamento atual:\*\* Se o usuário enviar no payload um valor diferente de `totalCopies` para `availableCopies` (ex: `totalCopies: 10, availableCopies: 5`), o sistema salvará o livro com esses valores distintos ou até mesmos valores que violem a restrição da regra de negócio.

\* \*\*Requisito relacionado:\*\* CA01 Um livro válido deve ser armazenado com a quantidade disponível igual à quantidade total / RN09 A quantidade disponível deve permanecer entre zero e a quantidade total de exemplares.

