Encontrei \*\*4 defeitos funcionais\*\* no Pull Request.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/books/book.service.js`, `createBook()`, linha `findOne({ isbn, title })` | \*\*A validação de unicidade do ISBN depende também do título.\*\* Um livro com ISBN já existente, mas título diferente, não será encontrado como duplicado. | O cadastro deve ser rejeitado sempre que já existir qualquer livro com o mesmo ISBN. | O repositório só retorna um livro se \*\*ISBN e título\*\* coincidirem. Assim, é possível cadastrar dois livros com o mesmo ISBN desde que tenham títulos diferentes. | \*\*CA02\*\* — ISBN deve ser obrigatório e único. |

| `src/books/book.service.js`, chamada a `bookRepository.save(...)` antes das validações | \*\*O livro é persistido antes de ser validado.\*\* Quando ISBN, título, autor ou quantidade são inválidos, uma exceção é lançada somente após a alteração do acervo. | Todas as validações devem ocorrer antes da persistência. Um cadastro inválido deve deixar o acervo inalterado. | O livro inválido é inserido no repositório e depois a operação retorna erro. Um `GET /books` posterior poderá listar esse registro rejeitado. | \*\*CA05\*\* e \*\*RN08\*\* — cadastro/operação rejeitada não pode alterar o acervo. |

| `src/books/book.service.js`, `if (!totalCopies)` | \*\*A validação da quantidade total não rejeita números negativos.\*\* | `totalCopies` deve ser estritamente maior que zero. Valores `0`, negativos ou inválidos devem ser rejeitados. | A condição só rejeita valores \*falsy\*. Por exemplo, `totalCopies: -1` passa pela validação e é cadastrado. | \*\*CA04\*\* — quantidade total deve ser maior que zero; \*\*RN09\*\* — quantidade disponível deve permanecer entre zero e a quantidade total. |

| `src/books/book.service.js`, `availableCopies: input.availableCopies ?? totalCopies` | \*\*O cliente pode definir arbitrariamente a quantidade disponível no cadastro.\*\* | Todo novo livro deve ser criado com `availableCopies === totalCopies`, independentemente de um eventual `availableCopies` enviado na requisição. | Se o cliente enviar `availableCopies`, esse valor é persistido. É possível cadastrar, por exemplo, `totalCopies: 5` e `availableCopies: 2`, `-1` ou `10`. | \*\*CA01\*\* — quantidade disponível deve iniciar igual à total; \*\*RN09\*\* — disponível deve ficar entre zero e total. |



Um exemplo particularmente crítico é uma requisição como `{ "isbn": "", "title": "", "author": "", "totalCopies": 0 }`: a API responde com erro, mas o registro já foi inserido em `#books`, violando diretamente a atomicidade exigida por \*\*CA05/RN08\*\*.

