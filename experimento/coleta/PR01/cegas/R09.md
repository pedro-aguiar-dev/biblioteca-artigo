Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/books/book.service.js`, linha do `findOne({ isbn, title })` | \*\*A unicidade do ISBN é verificada junto com o título.\*\* O repositório só encontra um livro quando \*\*ISBN e título\*\* são iguais. Assim, é possível cadastrar outro livro com o mesmo ISBN e título diferente. | Antes do cadastro, deve ser verificado se já existe qualquer livro com o mesmo ISBN, independentemente do título. Ex.: `findOne({ isbn })`. | Um livro `{isbn: "123", title: "A"}` não impede o cadastro de `{isbn: "123", title: "B"}`. | \*\*CA02 — ISBN obrigatório e único.\*\* |

| `src/books/book.service.js`, chamada a `bookRepository.save(...)` antes das validações | \*\*O livro é persistido antes da validação dos campos.\*\* Se ISBN, título, autor ou quantidade forem inválidos, uma exceção é lançada somente depois de o acervo já ter sido alterado. | Todas as validações devem ocorrer antes de qualquer persistência. Uma requisição inválida deve deixar o acervo exatamente como estava. | O livro inválido fica armazenado no repositório mesmo que `createBook` termine lançando `INVALID\_BOOK` ou `INVALID\_QUANTITY`. Ele poderá inclusive aparecer posteriormente em `GET /books`. | \*\*CA05 — cadastro inválido deve ser rejeitado sem alterar o acervo; RN08 — operação rejeitada não pode modificar os dados.\*\* |

| `src/books/book.service.js`, `if (!totalCopies)` | \*\*A validação não garante que a quantidade total seja maior que zero.\*\* O teste verifica apenas se o valor é falsy. Valores negativos, por exemplo `-1`, são truthy em JavaScript e são aceitos. | Aceitar somente `totalCopies > 0`. | `totalCopies: -1` passa pela validação e o cadastro é considerado válido. | \*\*CA04 — quantidade total deve ser maior que zero; RN09 — quantidade disponível deve permanecer entre zero e a quantidade total.\*\* |

| `src/books/book.service.js`, `availableCopies: input.availableCopies ?? totalCopies` | \*\*O cliente consegue definir a quantidade disponível no cadastro.\*\* Isso viola a regra de que um livro novo deve começar com disponibilidade igual à quantidade total e também permite valores fora dos limites. | No cadastro, `availableCopies` deve ser definido exclusivamente como `totalCopies`, ignorando qualquer valor enviado pelo cliente. | Com `{totalCopies: 10, availableCopies: 3}`, o livro é criado com 3 disponíveis. Com `availableCopies: 20` ou `-1`, também é possível armazenar uma disponibilidade fora do intervalo permitido. | \*\*CA01 — quantidade disponível deve ser igual à quantidade total no cadastro; RN09 — disponibilidade entre zero e quantidade total.\*\* |



Um fluxo correto para `createBook` seria, conceitualmente: \*\*validar campos → validar `totalCopies > 0` → verificar existência por `{ isbn }` → salvar com `availableCopies: totalCopies`\*\*.

