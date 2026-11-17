Com base nos requisitos fornecidos, foram identificados \*\*três defeitos funcionais\*\* no Pull Request:



\### 1. Rejeição indevida de devoluções com atraso



\* \*\*Localização:\*\* `src/loans/loan.service.js` na chamada `validateLoanIsNotOverdue(loan, formatDate(currentDate));` e na função `validateLoanIsNotOverdue`.

\* \*\*Descrição do problema:\*\* O código contém uma validação que interrompe o fluxo e lança um erro caso a data atual seja superior à data prevista de devolução (`loan.dueDate < currentDate`).

\* \*\*Comportamento esperado:\*\* A operação de devolução deve prosseguir normalmente e com sucesso, independentemente de o empréstimo estar ou não atrasado.

\* \*\*Comportamento atual:\*\* O sistema lança a exceção `OVERDUE\_LOAN` (HTTP 409) e impede a devolução de livros atrasados.

\* \*\*Requisito relacionado:\*\* CA24 (A devolução deve ser aceita mesmo quando estiver atrasada).



\### 2. Restauração incorreta da quantidade disponível do livro



\* \*\*Localização:\*\* `src/loans/loan.service.js` na linha `book.availableCopies = book.totalCopies;`.

\* \*\*Descrição do problema:\*\* Em vez de preservar o incremento de 1 unidade que havia sido feito previamente (`book.availableCopies += 1`), o código sobrescreve a quantidade disponível igualando-a à quantidade total do livro logo antes de salvar no repositório.

\* \*\*Comportamento esperado:\*\* A quantidade disponível do livro deve aumentar em exatamente 1 unidade após uma devolução.

\* \*\*Comportamento atual:\*\* A quantidade disponível passa a ser o total de cópias do livro. Isso ignora e "zera" o abatimento de outros empréstimos paralelos do mesmo livro que ainda não foram devolvidos.

\* \*\*Requisito relacionado:\*\* CA23 (A quantidade disponível do livro deve aumentar em uma unidade).



\### 3. Mutação de estado antes das validações (Efeito Colateral em Operação Rejeitada)



\* \*\*Localização:\*\* `src/loans/loan.service.js` na linha `book.availableCopies += 1;` que ocorre \*antes\* da validação `if (loan.returnDate)`.

\* \*\*Descrição do problema:\*\* O código incrementa o atributo `availableCopies` do objeto do livro em memória antes de verificar as regras que podem interromper o fluxo (como tentar devolver um livro já devolvido). Como a instância em memória pode ser uma referência direta ao dado do repositório, essa alteração vaza para o sistema, mesmo que o método `save()` nunca venha a ser chamado pela interrupção da exceção.

\* \*\*Comportamento esperado:\*\* A modificação nos dados da entidade (incremento da quantidade) só deve ser efetuada após a aprovação em todas as regras de negócio e validações de estado.

\* \*\*Comportamento atual:\*\* Uma tentativa duplicada de devolução falha corretamente (exceção é lançada), mas a quantidade disponível de livros já foi indevidamente incrementada em +1 na memória, corrompendo os dados do sistema.

\* \*\*Requisito relacionado:\*\* RN08 (Uma operação rejeitada não pode modificar os dados do sistema) e CA26 (Uma tentativa duplicada não pode aumentar novamente a quantidade disponível).

