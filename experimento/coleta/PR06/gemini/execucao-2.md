Aqui estão os defeitos funcionais encontrados no Pull Request, baseados nos requisitos fornecidos:



\*\*Defeito 1\*\*



\* \*\*localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, linha `if (loan.dueDate <= operationDate)`

\* \*\*descrição do problema:\*\* A verificação de atraso está incorreta, pois rejeita a renovação caso ela seja feita exatamente no dia do vencimento.

\* \*\*comportamento esperado:\*\* O empréstimo só deve ser considerado atrasado se a data prevista (`dueDate`) for estritamente anterior à data da operação (`operationDate`), permitindo a renovação no dia do vencimento.

\* \*\*comportamento atual:\*\* O uso do operador `<=` considera o empréstimo atrasado mesmo quando a data prevista é igual à data da operação, rejeitando indevidamente a requisição.

\* \*\*requisito relacionado:\*\* RN07 e CA30.



\*\*Defeito 2\*\*



\* \*\*localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`

\* \*\*descrição do problema:\*\* O cálculo da nova data prevista do empréstimo está utilizando a data base errada.

\* \*\*comportamento esperado:\*\* A nova data deve ser calculada somando-se 7 dias à data prevista atual do empréstimo (`loan.dueDate`).

\* \*\*comportamento atual:\*\* O sistema está somando 7 dias à data atual da operação (`currentDate`).

\* \*\*requisito relacionado:\*\* CA27 e RN02.



\*\*Defeito 3\*\*



\* \*\*localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, linha `return this.persistLoan(loan, book);` (e método `persistLoan`)

\* \*\*descrição do problema:\*\* O uso do método auxiliar `persistLoan` para concluir a renovação gera um efeito colateral indesejado no estoque de livros.

\* \*\*comportamento esperado:\*\* A operação de renovação não deve alterar a quantidade disponível de exemplares do livro.

\* \*\*comportamento atual:\*\* Como o método `persistLoan` possui a instrução `book.availableCopies -= 1`, a renovação do empréstimo acaba subtraindo indevidamente uma unidade da quantidade disponível de livros a cada vez que é executada.

\* \*\*requisito relacionado:\*\* CA29.

