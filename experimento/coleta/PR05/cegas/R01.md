\# Revisão do Pull Request: devolução de empréstimos



Encontrei \*\*4 defeitos funcionais\*\* em `src/loans/loan.service.js`, todos no método `returnLoan`.



\---



\## Defeito 1: Devolução atrasada é rejeitada



\- \*\*Localização:\*\* `loan.service.js`, `returnLoan` (chamada a `validateLoanIsNotOverdue`) e a função `validateLoanIsNotOverdue`.

\- \*\*Descrição do problema:\*\* O método valida se `loan.dueDate < currentDate` e lança `OVERDUE\_LOAN` (409), impedindo a devolução de empréstimos atrasados.

\- \*\*Comportamento esperado:\*\* A devolução deve ser aceita mesmo quando estiver atrasada, com a data de devolução registrada normalmente.

\- \*\*Comportamento atual:\*\* Um empréstimo vencido não pode ser devolvido. Retorna erro 409 e o livro permanece em aberto.

\- \*\*Requisito relacionado:\*\* CA24 (e, consequentemente, o objetivo de RF05).



\---



\## Defeito 2: Quantidade disponível é sobrescrita com a quantidade total



\- \*\*Localização:\*\* `loan.service.js`, `returnLoan`, linha `book.availableCopies = book.totalCopies;`.

\- \*\*Descrição do problema:\*\* Após salvar o empréstimo, o código ignora o incremento e atribui à quantidade disponível o valor da quantidade total.

\- \*\*Comportamento esperado:\*\* A quantidade disponível deve aumentar em exatamente uma unidade (`disponível + 1`).

\- \*\*Comportamento atual:\*\* A quantidade disponível passa a ser igual à total. Se houver outros empréstimos em aberto do mesmo livro, o estoque fica inflado, o que permite novos empréstimos além dos exemplares realmente disponíveis.

\- \*\*Requisito relacionado:\*\* CA23 e RN09 (disponível não pode exceder o total de forma indevida em relação ao estado real).



\---



\## Defeito 3: Incremento aplicado antes das validações, em objeto potencialmente compartilhado



\- \*\*Localização:\*\* `loan.service.js`, `returnLoan`, linha `book.availableCopies += 1;` (posicionada antes da verificação `loan.returnDate` e de `validateLoanIsNotOverdue`).

\- \*\*Descrição do problema:\*\* O livro é modificado antes de as regras de rejeição serem avaliadas. Se o repositório devolver a referência do objeto armazenado (como `findById` faz com `find`, sem cópia), o incremento altera o estado em memória do sistema mesmo quando a operação é rejeitada em seguida (`LOAN\_ALREADY\_RETURNED` ou `OVERDUE\_LOAN`). Basta qualquer outra operação salvar esse livro depois para a alteração ser persistida.

\- \*\*Comportamento esperado:\*\* Uma operação rejeitada não deve alterar nenhum dado. Todas as validações devem ocorrer antes de qualquer mutação.

\- \*\*Comportamento atual:\*\* Uma devolução duplicada (ou atrasada) pode incrementar `availableCopies` indevidamente, podendo ultrapassar o total.

\- \*\*Requisito relacionado:\*\* RN08, CA26 e RN09.



\---



\## Defeito 4: Gravação do empréstimo e do livro sem atomicidade



\- \*\*Localização:\*\* `loan.service.js`, `returnLoan`, sequência `loanRepository.save(loan)` seguida de `bookRepository.save(book)`.

\- \*\*Descrição do problema:\*\* Os dois salvamentos são feitos separadamente, sem `runInTransaction`, embora o fluxo de criação de empréstimo (`persistLoan`) use transação para o mesmo par de repositórios. Se o segundo salvamento falhar, o empréstimo fica marcado como devolvido sem que o estoque seja atualizado. O próprio `loan.returnDate = ...` também altera o objeto do repositório antes do `save`.

\- \*\*Comportamento esperado:\*\* Registrar a devolução e atualizar o estoque como uma única operação atômica, como já é feito na criação do empréstimo.

\- \*\*Comportamento atual:\*\* Falha parcial deixa os dados inconsistentes (empréstimo devolvido, estoque não incrementado).

\- \*\*Requisito relacionado:\*\* CA22 e CA23 (devem ocorrer em conjunto) e RN08.



\---



\## Observações



\- CA25 (impedir segunda devolução) está atendido na checagem de `loan.returnDate`, mas depende da ordem corrigida no Defeito 3 para respeitar CA26 e RN08.

\- A rota usa `req.body?.currentDate` fornecida pelo cliente. Isso é coerente com o padrão do restante do serviço (parse e validação da data), então não reportei como defeito.



\*\*Correção sugerida (esboço):\*\*



```js

const loan = await this.loanRepository.findById(loanId);

if (!loan) throw new AppError("LOAN\_NOT\_FOUND", 404);

if (loan.returnDate) throw new AppError("LOAN\_ALREADY\_RETURNED", 409);



const book = await this.bookRepository.findOne({ id: loan.bookId });

if (!book) throw new AppError("BOOK\_NOT\_FOUND", 404);



loan.returnDate = formatDate(currentDate);

book.availableCopies += 1;

return this.persistLoan(loan, book); // dentro de transação

```

