Aqui estão os defeitos funcionais identificados no Pull Request, com base nos requisitos e regras de negócio fornecidos:



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js`, no método `renewLoan`, na linha `loan.dueDate = formatDate(addDays(currentDate, 7));`.

\* \*\*Descrição do problema:\*\* O cálculo da nova data de devolução está sendo feito usando a data da operação em vez da data prevista atual do empréstimo.

\* \*\*Comportamento esperado:\*\* A renovação deve somar 7 dias à data prevista atual do empréstimo (`loan.dueDate`).

\* \*\*Comportamento atual:\*\* A renovação está somando 7 dias à data da requisição/operação (`currentDate`).

\* \*\*Requisito relacionado:\*\* CA27 / RN02 (Cada renovação acrescenta 7 dias à data prevista atual).



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js`, no método `renewLoan`, na linha `if (loan.dueDate <= operationDate) {`.

\* \*\*Descrição do problema:\*\* A lógica de validação de atraso está rejeitando a renovação de empréstimos que vencem no mesmo dia da operação.

\* \*\*Comportamento esperado:\*\* O empréstimo só deve ser considerado atrasado se a data prevista for estritamente anterior (`<`) à data da operação.

\* \*\*Comportamento atual:\*\* O sistema está considerando o empréstimo atrasado também quando a data prevista é igual (`<=`) à data da operação.

\* \*\*Requisito relacionado:\*\* CA30 / RN07 (Um empréstimo está atrasado quando a data prevista é anterior à data da operação).



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js`, no método `renewLoan`, na linha `return this.persistLoan(loan, book);`.

\* \*\*Descrição do problema:\*\* O método `renewLoan` delega a persistência final para `persistLoan`. No entanto, `persistLoan` é o método utilizado na criação do empréstimo original e contém a regra de decrementar as cópias disponíveis do livro.

\* \*\*Comportamento esperado:\*\* A quantidade de livros disponíveis não deve ser alterada em uma operação de renovação.

\* \*\*Comportamento atual:\*\* Ao chamar `persistLoan`, o sistema está indevidamente subtraindo uma unidade do total de livros disponíveis (`book.availableCopies -= 1`).

\* \*\*Requisito relacionado:\*\* CA29 (A quantidade disponível não deve ser alterada).

