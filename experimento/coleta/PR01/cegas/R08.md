\## Revisão de Código — PR de Cadastro de Livros (RF01)



Foram encontrados \*\*4 defeitos funcionais\*\*.



\---



\### Defeito 1 — Persistência ocorre antes da validação



\*\*Localização:\*\* `src/books/book.service.js`, método `createBook` (chamada de `this.bookRepository.save(...)` posicionada acima dos blocos `if (isBlank(...))` e `if (!totalCopies)`).



\*\*Descrição:\*\* O livro é gravado no repositório antes de qualquer verificação de campos obrigatórios e de quantidade. Quando a validação falha, a exceção é lançada, mas o registro inválido já foi inserido em `#books` e o contador `#nextId` já foi incrementado. Não há rollback.



\*\*Comportamento esperado:\*\* Um cadastro inválido é rejeitado e o acervo permanece inalterado.



\*\*Comportamento atual:\*\* `POST /books` com título vazio (por exemplo) retorna erro, mas o livro inválido aparece em `GET /books`.



\*\*Requisito relacionado:\*\* CA05, RN08.



\*\*Observação adicional:\*\* esse defeito contamina a checagem de unicidade de requisições seguintes — livros inválidos com `isbn: undefined` ficam no acervo e passam a casar com novas tentativas que também tenham ISBN ausente.



\---



\### Defeito 2 — Verificação de unicidade combina ISBN com título



\*\*Localização:\*\* `src/books/book.service.js` — `await this.bookRepository.findOne({ isbn, title })`.



\*\*Descrição:\*\* O `findOne` do repositório exige que \*\*todos\*\* os critérios casem (`conditions.every`). Ao incluir `title`, um ISBN já existente deixa de ser detectado se o título for diferente.



\*\*Comportamento esperado:\*\* O ISBN é único no acervo; qualquer cadastro com ISBN já existente é rejeitado com conflito.



\*\*Comportamento atual:\*\* Cadastrar `{isbn: "978-1", title: "A"}` e depois `{isbn: "978-1", title: "B"}` cria dois livros com o mesmo ISBN.



\*\*Requisito relacionado:\*\* CA02.



\---



\### Defeito 3 — Validação de quantidade aceita valores negativos



\*\*Localização:\*\* `src/books/book.service.js` — `if (!totalCopies) { throw new AppError("INVALID\_QUANTITY"); }`.



\*\*Descrição:\*\* A checagem por valor falsy rejeita `0`, `undefined` e `null`, mas aprova qualquer número negativo (`-3` é truthy). Também aceita valores não numéricos como `"5"` ou `"abc"`.



\*\*Comportamento esperado:\*\* A quantidade total deve ser um número inteiro maior que zero; `-3` é rejeitado.



\*\*Comportamento atual:\*\* `{totalCopies: -3}` é aceito e armazenado, gerando um livro com quantidade total e disponível negativas.



\*\*Requisito relacionado:\*\* CA04, RN09.



\---



\### Defeito 4 — `availableCopies` é aceito do payload do cliente



\*\*Localização:\*\* `src/books/book.service.js` — `availableCopies: input.availableCopies ?? totalCopies`.



\*\*Descrição:\*\* O campo quantidade disponível deveria ser derivado internamente, sempre igual à quantidade total no cadastro. Ao aceitar o valor enviado na requisição, o cliente controla esse campo livremente, sem qualquer validação de faixa.



\*\*Comportamento esperado:\*\* Livro recém-cadastrado tem `availableCopies === totalCopies`, e a disponibilidade sempre fica entre zero e o total.



\*\*Comportamento atual:\*\* `{totalCopies: 2, availableCopies: 99}` cria um livro com disponibilidade maior que o total; `{totalCopies: 2, availableCopies: -1}` cria disponibilidade negativa.



\*\*Requisito relacionado:\*\* CA01, RN09.

