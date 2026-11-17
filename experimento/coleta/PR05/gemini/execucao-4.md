Aqui está a análise da revisão de código baseada nos requisitos funcionais e regras de negócio:



\### Defeito 1: Rejeição de devolução com atraso



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `returnLoan` e função `validateLoanIsNotOverdue`).

\* \*\*Descrição do problema:\*\* O código realiza uma validação e lança uma exceção (`OVERDUE\_LOAN`) caso o empréstimo esteja atrasado (data prevista menor que a data atual), o que bloqueia o fluxo de devolução.

\* \*\*Comportamento esperado:\*\* O sistema deve processar e aceitar a devolução do livro normalmente, independentemente de estar atrasada.

\* \*\*Comportamento atual:\*\* A devolução é interrompida e rejeitada com erro 409 quando o livro é entregue após o prazo.

\* \*\*Requisito relacionado:\*\* CA24 (A devolução deve ser aceita mesmo quando estiver atrasada).



\### Defeito 2: Sobrescrita incorreta da quantidade disponível



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `returnLoan`, na linha `book.availableCopies = book.totalCopies;`).

\* \*\*Descrição do problema:\*\* Apesar de o código incrementar em 1 a disponibilidade corretamente mais acima (`book.availableCopies += 1;`), no momento antes de salvar no repositório, ele iguala a quantidade disponível à quantidade total. Se a biblioteca possuir 5 cópias de um livro e 3 estiverem emprestadas (2 disponíveis), a devolução de um exemplar fará a disponibilidade pular diretamente para 5 em vez de 3.

\* \*\*Comportamento esperado:\*\* A quantidade disponível do livro deve ser incrementada em exatamente uma unidade a partir do seu valor atual na devolução.

\* \*\*Comportamento atual:\*\* A quantidade disponível é definida com o valor da quantidade total do livro, gerando falsos exemplares disponíveis caso haja outros empréstimos do mesmo livro em aberto.

\* \*\*Requisito relacionado:\*\* CA23 (A quantidade disponível do livro deve aumentar em uma unidade).



\### Defeito 3: Mutação de dados antes da validação de tentativa duplicada



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `returnLoan`, linha `book.availableCopies += 1;` colocada antes da checagem `if (loan.returnDate)`).

\* \*\*Descrição do problema:\*\* O objeto `book` em memória tem sua quantidade incrementada \*antes\* de o código verificar se o empréstimo já havia sido devolvido. Como o sistema parece usar objetos persistidos em memória (conforme sugere o uso de `this.#loans` no repositório), a alteração da propriedade contamina o estado do sistema mesmo que a função lance o erro `LOAN\_ALREADY\_RETURNED` na linha seguinte.

\* \*\*Comportamento esperado:\*\* A tentativa de devolver um empréstimo já devolvido deve ser validada antes de qualquer alteração no estado dos objetos, impedindo o incremento da quantidade disponível.

\* \*\*Comportamento atual:\*\* O livro tem a sua quantidade disponível incrementada na memória antes da operação ser rejeitada por ser uma devolução duplicada.

\* \*\*Requisito relacionado:\*\* RN08 (Uma operação rejeitada não pode modificar os dados do sistema) e CA26 (Uma tentativa duplicada não pode aumentar novamente a quantidade disponível).

