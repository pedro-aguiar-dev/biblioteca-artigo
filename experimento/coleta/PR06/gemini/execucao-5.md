Com base na análise do Pull Request e nos requisitos de negócio fornecidos, foram identificados três defeitos funcionais.



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js` - Método `renewLoan` - Linha: `if (loan.dueDate <= operationDate)`

\* \*\*Descrição do problema:\*\* A validação de atraso está considerando o empréstimo como atrasado caso a data da operação seja igual à data prevista.

\* \*\*Comportamento esperado:\*\* A renovação deve ser permitida caso a data da operação seja o dia exato da data prevista, lançando exceção de atraso apenas se a data prevista for estritamente anterior à data da operação (`<`).

\* \*\*Comportamento atual:\*\* O sistema lança o erro `"OVERDUE\_LOAN"` quando `loan.dueDate` é igual a `operationDate` (`<=`).

\* \*\*Requisito relacionado:\*\* CA30 e RN07 (\*"Um empréstimo está atrasado quando a data prevista é anterior à data da operação"\*).



\---



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js` - Método `renewLoan` - Linha: `loan.dueDate = formatDate(addDays(currentDate, 7));`

\* \*\*Descrição do problema:\*\* O cálculo da nova data do empréstimo está adicionando os 7 dias à data em que a operação foi realizada (`currentDate`), e não à data prevista atual do empréstimo.

\* \*\*Comportamento esperado:\*\* Os 7 dias devem ser adicionados sobre o valor atual de `loan.dueDate` (data prevista atual).

\* \*\*Comportamento atual:\*\* A nova data prevista está sendo definida como 7 dias a partir da data de operação (`currentDate`).

\* \*\*Requisito relacionado:\*\* CA27 e RN02 (\*"Cada renovação acrescenta 7 dias à data prevista atual"\*).



\---



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js` - Método `renewLoan` - Linha: `return this.persistLoan(loan, book);`

\* \*\*Descrição do problema:\*\* O método `renewLoan` delega o salvamento para o método `persistLoan`. No entanto, o `persistLoan` contém lógica acoplada à criação de empréstimos e efetua o decremento da quantidade disponível do livro (`book.availableCopies -= 1;`).

\* \*\*Comportamento esperado:\*\* O saldo de cópias disponíveis do livro não deve sofrer nenhum tipo de alteração durante a operação de renovação.

\* \*\*Comportamento atual:\*\* O sistema subtrai 1 da quantidade de cópias disponíveis do livro no banco de dados a cada renovação aprovada.

\* \*\*Requisito relacionado:\*\* CA29 (\*"A quantidade disponível não deve ser alterada"\*).

