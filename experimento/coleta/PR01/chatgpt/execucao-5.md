Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/books/book.service.js`, linha do `findOne({ isbn, title })` | A verificação de unicidade considera \*\*ISBN e título conjuntamente\*\*, embora apenas o ISBN deva ser único. | Se já existir qualquer livro com o mesmo ISBN, o novo cadastro deve ser rejeitado, independentemente do título. | Um livro com ISBN já existente pode ser cadastrado se possuir título diferente. | \*\*CA02 — ISBN obrigatório e único\*\* |

| `src/books/book.service.js`, chamada a `bookRepository.save(...)` antes das validações | O livro é persistido \*\*antes\*\* de validar campos obrigatórios e quantidade. Quando uma validação falha posteriormente, o registro inválido já foi incluído no repositório. | Toda validação deve ocorrer antes da persistência; uma requisição inválida deve deixar o acervo inalterado. | Por exemplo, um livro com `title: ""` é salvo e depois `INVALID\_BOOK` é lançado. O cliente recebe erro, mas o livro permanece no acervo e aparece em `GET /books`. | \*\*CA05\*\* e \*\*RN08\*\* |

| `src/books/book.service.js`, `if (!totalCopies)` | A validação não garante que a quantidade total seja \*\*maior que zero\*\*. Valores negativos são truthy em JavaScript e passam pela validação. | `totalCopies` deve ser rejeitado quando for zero, negativo ou de outra forma não representar uma quantidade válida maior que zero. | `totalCopies: -1`, por exemplo, é aceito e armazenado. | \*\*CA04 — quantidade total maior que zero\*\* |

| `src/books/book.service.js`, `availableCopies: input.availableCopies ?? totalCopies` | O cadastro aceita `availableCopies` fornecido pelo cliente, permitindo criar o livro com disponibilidade diferente da quantidade total e até fora do intervalo permitido. | Em um novo livro, `availableCopies` deve ser definido pelo sistema exatamente como `totalCopies`, permanecendo entre `0` e `totalCopies`. | Uma entrada como `{ totalCopies: 5, availableCopies: 2 }` é cadastrada com 2 disponíveis; valores como `-1` ou `10` também podem ser persistidos. | \*\*CA01\*\* e \*\*RN09\*\* |



Os dois defeitos mais críticos combinam-se: como a persistência ocorre antes da validação, além de aceitar determinados dados inválidos, o serviço também \*\*altera o acervo em requisições que terminam em erro\*\*.

