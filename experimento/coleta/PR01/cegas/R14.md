Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/books/book.service.js`, `createBook()`: `findOne({ isbn, title })` | A verificação de unicidade considera simultaneamente ISBN e título. Assim, um ISBN já cadastrado pode ser reutilizado se o novo livro tiver outro título. | A existência de qualquer livro com o mesmo ISBN deve impedir o cadastro, independentemente do título. | Só rejeita quando \*\*ISBN e título\*\* coincidem com um livro existente. Ex.: `{ isbn: "123", title: "A" }` seguido de `{ isbn: "123", title: "B" }` é aceito. | \*\*CA02\*\* — ISBN obrigatório e único. |

| `src/books/book.service.js`, `createBook()`: chamada a `bookRepository.save(...)` antes das validações | O livro é persistido antes de validar ISBN, título, autor e quantidade. Quando uma validação falha, a exceção é lançada depois de o acervo já ter sido alterado. | Todo dado deve ser validado antes da persistência; um cadastro inválido deve deixar o acervo inalterado. | Um POST inválido pode retornar erro, mas o livro permanece salvo e aparece posteriormente em `GET /books`. | \*\*CA05\*\* e \*\*RN08\*\* — operações rejeitadas não podem alterar o acervo. |

| `src/books/book.service.js`, `createBook()`: `if (!totalCopies)` | A validação não garante que a quantidade total seja maior que zero. | Aceitar apenas `totalCopies > 0`. Valores negativos devem ser rejeitados. | Valores negativos são truthy em JavaScript e passam pela validação. Ex.: `totalCopies: -1` resulta em cadastro aceito. | \*\*CA04\*\* — quantidade total deve ser maior que zero; também pode violar \*\*RN09\*\*. |

| `src/books/book.service.js`, criação do objeto: `availableCopies: input.availableCopies ?? totalCopies` | O cliente consegue definir a quantidade disponível no cadastro, apesar de um novo livro dever iniciar sempre com disponibilidade igual à quantidade total. Isso também permite valores fora do intervalo permitido. | Ignorar/não aceitar `availableCopies` no cadastro e definir sempre `availableCopies = totalCopies`. | Um payload como `{ totalCopies: 5, availableCopies: 2 }` cria o livro com apenas 2 disponíveis; `{ totalCopies: 5, availableCopies: 10 }` cria um estado inválido. | \*\*CA01\*\* — disponível deve iniciar igual ao total; \*\*RN09\*\* — disponível deve estar entre zero e o total. |



Um ponto especialmente crítico é o segundo: por causa da ordem `save → validate`, \*\*todos os erros de validação posteriores podem deixar registros inválidos no acervo\*\*, apesar de a requisição ser rejeitada.

