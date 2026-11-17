Aqui estão os defeitos funcionais identificados no Pull Request com base nas regras de negócio fornecidas:



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js` (chamada no método `returnLoan` e função `validateLoanIsNotOverdue`).

\* \*\*Descrição do problema:\*\* O código introduziu uma validação (`validateLoanIsNotOverdue`) que impede o andamento da função e lança um erro `OVERDUE\_LOAN` (409) caso a data atual seja maior que a data de vencimento.

\* \*\*Comportamento esperado:\*\* A devolução do empréstimo deve ser processada e registrada com sucesso independentemente de estar atrasada.

\* \*\*Comportamento atual:\*\* A devolução é interrompida e rejeitada pelo sistema caso o empréstimo esteja atrasado.

\* \*\*Requisito relacionado:\*\* CA24 A devolução deve ser aceita mesmo quando estiver atrasada.



\---



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `returnLoan`).

\* \*\*Descrição do problema:\*\* Antes de salvar as alterações do livro, o código está atribuindo à quantidade de cópias disponíveis o valor total de cópias cadastradas (`book.availableCopies = book.totalCopies;`). Caso outras cópias deste mesmo livro estejam emprestadas para outros usuários, a quantidade disponível no sistema ficará irreal (maior do que o que fisicamente está disponível na biblioteca).

\* \*\*Comportamento esperado:\*\* A quantidade disponível de cópias do livro deve aumentar em estritamente 1 unidade a cada devolução processada.

\* \*\*Comportamento atual:\*\* A quantidade disponível de livros está sendo resetada para o número total da coleção toda vez que uma devolução ocorre, sobrescrevendo a tentativa anterior de `book.availableCopies += 1;`.

\* \*\*Requisito relacionado:\*\* CA23 A quantidade disponível do livro deve aumentar em uma unidade.



\---



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `returnLoan`).

\* \*\*Descrição do problema:\*\* A modificação do estado do objeto `book` (`book.availableCopies += 1;`) é feita \*\*antes\*\* da validação que verifica se o empréstimo já havia sido devolvido (`if (loan.returnDate)`). Considerando que as entidades trazidas do repositório mantêm a referência de memória, essa mutação antecipada altera os dados em memória antes da operação lançar erro e ser rejeitada.

\* \*\*Comportamento esperado:\*\* Modificações nos dados do sistema ou mutações de estado só devem ocorrer caso a operação seja validada e aceita. Uma tentativa de devolução duplicada não pode surtir nenhum efeito sobre os dados.

\* \*\*Comportamento atual:\*\* O sistema sofre uma alteração parcial no livro em memória (incremento de cópias disponíveis) mesmo que a operação de devolução venha a ser rejeitada logo na linha seguinte por ser duplicada.

\* \*\*Requisitos relacionados:\*\*

\* RN08 Uma operação rejeitada não pode modificar os dados do sistema.

\* CA26 Uma tentativa duplicada não pode aumentar novamente a quantidade disponível.

