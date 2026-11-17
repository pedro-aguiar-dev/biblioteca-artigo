\## Revisão de código — PR "Cadastro de livros (RF01)"



Foram identificados \*\*4 defeitos funcionais\*\*.



\---



\### Defeito 1 — Persistência ocorre antes das validações



\*\*Localização:\*\* `src/books/book.service.js`, `createBook` (chamada de `this.bookRepository.save(...)` posicionada antes dos blocos `if (isBlank(...))` e `if (!totalCopies)`).



\*\*Descrição:\*\* O livro é gravado no repositório e só depois os dados são validados. Quando a validação falha, a exceção é lançada, mas o registro inválido já foi inserido no array interno e recebeu um `id`, sem qualquer rollback.



\*\*Comportamento esperado:\*\* Um cadastro inválido deve ser rejeitado sem que nada seja gravado; o acervo deve permanecer idêntico ao estado anterior à requisição.



\*\*Comportamento atual:\*\* `POST /books` com título vazio (por exemplo) retorna erro, mas o livro inválido passa a constar no `GET /books` e o contador `#nextId` é incrementado.



\*\*Requisito relacionado:\*\* CA05, RN08.



\---



\### Defeito 2 — Verificação de duplicidade não é feita apenas por ISBN



\*\*Localização:\*\* `src/books/book.service.js` — `await this.bookRepository.findOne({ isbn, title })`.



\*\*Descrição:\*\* O critério de busca combina `isbn` \*\*e\*\* `title`, e o `findOne` do repositório exige que todas as condições sejam satisfeitas (`conditions.every`). Logo, a duplicidade só é detectada quando ISBN e título coincidem simultaneamente.



\*\*Comportamento esperado:\*\* Cadastro com ISBN já existente deve ser rejeitado (409), independentemente do título, autor ou demais campos.



\*\*Comportamento atual:\*\* Cadastrar um segundo livro com o mesmo ISBN e título diferente é aceito, resultando em ISBNs duplicados no acervo.



\*\*Requisito relacionado:\*\* CA02.



\---



\### Defeito 3 — `availableCopies` é aceito a partir da entrada do cliente



\*\*Localização:\*\* `src/books/book.service.js` — `availableCopies: input.availableCopies ?? totalCopies`.



\*\*Descrição:\*\* A quantidade disponível é derivada do corpo da requisição quando informada, em vez de ser sempre igual à quantidade total. Não há nenhuma validação sobre esse valor, permitindo valores negativos, superiores ao total ou de tipo inválido.



\*\*Comportamento esperado:\*\* No cadastro, `availableCopies` deve ser sempre igual a `totalCopies`, ignorando qualquer valor enviado pelo cliente, e deve obrigatoriamente respeitar o intervalo entre zero e a quantidade total.



\*\*Comportamento atual:\*\* `POST /books` com `{"totalCopies": 5, "availableCopies": 99}` (ou `-3`) é armazenado com o valor enviado, quebrando o invariante do modelo.



\*\*Requisito relacionado:\*\* CA01, RN09.



\---



\### Defeito 4 — Validação da quantidade total usa teste de falsidade



\*\*Localização:\*\* `src/books/book.service.js` — `if (!totalCopies) { throw new AppError("INVALID\_QUANTITY"); }`.



\*\*Descrição:\*\* O teste `!totalCopies` só barra valores \*falsy\* (`0`, `undefined`, `null`, `""`, `NaN`). Não verifica se o valor é numérico nem se é positivo.



\*\*Comportamento esperado:\*\* Rejeitar o cadastro sempre que `totalCopies` não for um número inteiro maior que zero.



\*\*Comportamento atual:\*\* São aceitos valores como `-5`, `2.5`, `"abc"`, `"3"` ou `true`. Um livro com `totalCopies: -5` é cadastrado com `availableCopies: -5`, violando também o intervalo válido de exemplares.



\*\*Requisito relacionado:\*\* CA04, RN09.



\---



\### Observação complementar (não contabilizada como defeito)



Como consequência direta dos defeitos 1 e 4, a ordem correta esperada no `createBook` seria: validar entrada → verificar unicidade do ISBN → persistir. A reorganização do método resolve simultaneamente os defeitos 1 e 3.

