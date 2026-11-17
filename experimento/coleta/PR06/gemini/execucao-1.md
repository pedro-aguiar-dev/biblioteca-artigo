Aqui estão os defeitos funcionais identificados no Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `renewLoan`, na atribuição `loan.dueDate = formatDate(addDays(currentDate, 7));`)

\* \*\*Descrição do problema:\*\* O cálculo da nova data de devolução está sendo feito com base na data da operação, e não com base na data prevista original do empréstimo.

\* \*\*Comportamento esperado:\*\* A renovação deve adicionar 7 dias à data prevista atual do empréstimo (`loan.dueDate`).

\* \*\*Comportamento atual:\*\* A renovação está adicionando 7 dias à data em que a operação está sendo realizada (`currentDate`).

\* \*\*Requisito relacionado:\*\* CA27 e RN02.



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `renewLoan`, na condição `if (loan.dueDate <= operationDate)`)

\* \*\*Descrição do problema:\*\* A regra que impede a renovação de empréstimos atrasados está muito restrita, rejeitando a operação inclusive quando a data atual é exatamente igual à data prevista (no dia do vencimento).

\* \*\*Comportamento esperado:\*\* O sistema deve considerar o empréstimo atrasado apenas quando a data prevista for estritamente anterior (`<`) à data da operação, permitindo renovações no dia do vencimento.

\* \*\*Comportamento atual:\*\* O sistema rejeita a renovação se a data prevista for menor ou igual (`<=`) à data da operação.

\* \*\*Requisito relacionado:\*\* CA30 e RN07.



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `renewLoan`, na chamada `return this.persistLoan(loan, book);`)

\* \*\*Descrição do problema:\*\* A renovação está reutilizando o método `persistLoan`, que foi desenhado para a criação do empréstimo. Esse método contém a instrução `book.availableCopies -= 1`, o que deduz o estoque.

\* \*\*Comportamento esperado:\*\* A quantidade disponível de livros no acervo não deve sofrer nenhuma alteração durante uma renovação. Apenas o empréstimo deve ser atualizado no banco de dados.

\* \*\*Comportamento atual:\*\* A cada renovação, a quantidade de cópias disponíveis do livro está sendo reduzida indevidamente em uma unidade.

\* \*\*Requisito relacionado:\*\* CA29.

