\# Revisão do Pull Request: devolução de empréstimos



Encontrei \*\*4 defeitos funcionais\*\* em `returnLoan` (`src/loans/loan.service.js`).



\---



\## Defeito 1: Devolução atrasada é rejeitada



\*\*Localização:\*\* `loan.service.js`, chamada a `validateLoanIsNotOverdue(...)` em `returnLoan` e a função `validateLoanIsNotOverdue`.



\*\*Descrição do problema:\*\* O método lança `OVERDUE\_LOAN` (409) quando `loan.dueDate < currentDate`, impedindo a devolução de empréstimos vencidos.



\*\*Comportamento esperado:\*\* A devolução deve ser aceita mesmo atrasada: a data é registrada, a quantidade disponível aumenta em 1 e o empréstimo é marcado como devolvido.



\*\*Comportamento atual:\*\* Devoluções atrasadas retornam 409, o empréstimo continua em aberto e o livro não volta ao estoque.



\*\*Requisito relacionado:\*\* CA24 (e CA22/CA23 como consequência).



\---



\## Defeito 2: Estoque é sobrescrito com a quantidade total, não incrementado em 1



\*\*Localização:\*\* `loan.service.js`, `book.availableCopies = book.totalCopies;` antes de `bookRepository.save(book)`.



\*\*Descrição do problema:\*\* Após salvar o empréstimo, o código atribui `availableCopies = totalCopies`, descartando o incremento unitário.



\*\*Comportamento esperado:\*\* `availableCopies` deve aumentar exatamente em uma unidade (por exemplo, de 2 para 3 com total 5).



\*\*Comportamento atual:\*\* O estoque passa a ser o total, mesmo que outros exemplares ainda estejam emprestados. Isso faz o sistema acreditar que há mais exemplares disponíveis do que existem fisicamente.



\*\*Requisito relacionado:\*\* CA23 e RN09.



\---



\## Defeito 3: Livro é modificado antes da validação de "já devolvido" (risco de violar RN08)



\*\*Localização:\*\* `loan.service.js`, `book.availableCopies += 1;` executado antes de `if (loan.returnDate) { throw ... }`.



\*\*Descrição do problema:\*\* O incremento é feito no objeto `book` antes de verificar se o empréstimo já foi devolvido. Se o repositório devolver a referência do objeto em memória, e não uma cópia, o incremento persiste na tentativa rejeitada, mesmo sem `save`. O código fica dependente de um detalhe do repositório para respeitar a regra, e a ordem correta é validar antes de alterar qualquer estado.



\*\*Comportamento esperado:\*\* Uma tentativa rejeitada com `LOAN\_ALREADY\_RETURNED` não altera nenhum dado, inclusive a quantidade disponível do livro.



\*\*Comportamento atual:\*\* O objeto do livro já foi incrementado quando o erro é lançado. Com um repositório em memória que devolve referências, a duplicata aumenta o estoque (acima do total, no limite).



\*\*Requisito relacionado:\*\* CA25, CA26, RN08 e RN09.



\---



\## Defeito 4: Salvamento do empréstimo e do livro não é atômico



\*\*Localização:\*\* `loan.service.js`, sequência `loanRepository.save(loan)` → `bookRepository.save(book)`.



\*\*Descrição do problema:\*\* Os dois salvamentos são feitos separadamente, sem `runInTransaction`, que já é usado em `persistLoan` para a mesma combinação de repositórios. Se o segundo `save` falhar, o empréstimo fica marcado como devolvido e o estoque não é atualizado. Além disso, `loan.returnDate` é alterado diretamente no objeto antes do `save`, o que pode vazar a mudança em caso de erro.



\*\*Comportamento esperado:\*\* A devolução deve ser aplicada por inteiro ou não ser aplicada, como feito na criação de empréstimos.



\*\*Comportamento atual:\*\* Uma falha parcial deixa dados inconsistentes: o empréstimo devolvido sem reposição de estoque, e uma nova tentativa é rejeitada por CA25, de modo que o estoque nunca é corrigido.



\*\*Requisito relacionado:\*\* RN08 e CA23.



\---



\## Observação



Os defeitos 3 e 4 dependem do comportamento dos repositórios, que não aparecem no diff. O defeito 3 só tem efeito observável se `findOne` devolver a referência do objeto armazenado. Mesmo assim, a ordem atual é incorreta e vale corrigir. Os defeitos 1 e 2 ocorrem independentemente da implementação dos repositórios.



\## Correção sugerida



```js

async returnLoan(input) {

&#x20; const loanId = parseId(input?.loanId);

&#x20; const currentDate = parseDate(input?.currentDate);

&#x20; if (loanId === null || currentDate === null) {

&#x20;   throw new AppError("INVALID\_RETURN", 400);

&#x20; }



&#x20; const loan = await this.loanRepository.findById(loanId);

&#x20; if (!loan) throw new AppError("LOAN\_NOT\_FOUND", 404);



&#x20; if (loan.returnDate) {

&#x20;   throw new AppError("LOAN\_ALREADY\_RETURNED", 409);

&#x20; }



&#x20; const book = await this.bookRepository.findOne({ id: loan.bookId });

&#x20; if (!book) throw new AppError("BOOK\_NOT\_FOUND", 404);



&#x20; loan.returnDate = formatDate(currentDate);

&#x20; book.availableCopies += 1;



&#x20; return runInTransaction(

&#x20;   \[this.loanRepository, this.bookRepository],

&#x20;   async () => {

&#x20;     const returnedLoan = await this.loanRepository.save(loan);

&#x20;     await this.bookRepository.save(book);

&#x20;     return returnedLoan;

&#x20;   }

&#x20; );

}

```



(Remover também `validateLoanIsNotOverdue`, que deixa de ser usada. Ajuste a assinatura de `runInTransaction` conforme o uso em `persistLoan`.)

