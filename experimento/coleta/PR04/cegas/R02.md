Com base nos requisitos e regras de negócio fornecidos, foram identificados os seguintes defeitos funcionais no Pull Request:



\### 1. Alteração do estado do livro antes da conclusão das validações



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan` (linha onde ocorre `book.availableCopies -= 1;`).

\* \*\*Descrição do problema:\*\* A quantidade disponível do livro é reduzida antes que todas as regras de negócio sejam validadas. Como o objeto `book` em memória é modificado e a transação (`runInTransaction`) só engloba o salvamento no final da função (em `persistLoan`), se uma validação subsequente falhar e lançar uma exceção, a quantidade decrementada não será revertida.

\* \*\*Comportamento esperado:\*\* Qualquer operação rejeitada deve preservar a quantidade disponível e não modificar o estado do sistema.

\* \*\*Comportamento atual:\*\* A quantidade disponível de exemplares é reduzida e a modificação persiste na memória caso uma exceção (como limite de empréstimos excedido) seja lançada depois.

\* \*\*Requisito relacionado:\*\* CA21 e RN08.



\### 2. Contagem indevida de empréstimos já devolvidos no limite do usuário



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan` (chamada a `this.loanRepository.findByUser(userId)`).

\* \*\*Descrição do problema:\*\* O código busca todo o histórico de empréstimos do usuário para verificar o limite máximo, incluindo aqueles que já foram finalizados (devolvidos).

\* \*\*Comportamento esperado:\*\* O sistema deve contar e limitar a no máximo três apenas os empréstimos em aberto.

\* \*\*Comportamento atual:\*\* Um usuário fica bloqueado e impossibilitado de realizar um novo empréstimo assim que o total histórico de empréstimos (mesmo devolvidos) atinge a quantidade de três.

\* \*\*Requisito relacionado:\*\* CA19 e RN04.



\### 3. Considerar empréstimo como atrasado no dia do vencimento



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan` (condição `loan.dueDate <= operationDate`).

\* \*\*Descrição do problema:\*\* A lógica verifica se a data prevista (`dueDate`) é menor ou igual à data da operação para determinar se há atraso.

\* \*\*Comportamento esperado:\*\* Um empréstimo só deve ser considerado atrasado quando a data prevista for estritamente anterior (`<`) à data da operação.

\* \*\*Comportamento atual:\*\* Empréstimos são considerados atrasados e bloqueiam novos empréstimos no próprio dia do vencimento.

\* \*\*Requisito relacionado:\*\* RN07.



\### 4. Bloqueio indevido de novo empréstimo do mesmo livro (histórico)



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan` (chamada a `this.loanRepository.findByUserAndBook(userId, bookId)`).

\* \*\*Descrição do problema:\*\* O sistema usa uma função que busca empréstimos para o mesmo livro em todo o histórico do usuário, em vez de verificar apenas os empréstimos em aberto (o repositório possui `findOpenByUserAndBook` que deveria ser usado aqui).

\* \*\*Comportamento esperado:\*\* A operação só deve ser rejeitada se o usuário possuir um empréstimo \*em aberto\* daquele mesmo livro.

\* \*\*Comportamento atual:\*\* O sistema rejeita o empréstimo se o usuário já tiver pego e devolvido o mesmo livro em qualquer momento no passado.

\* \*\*Requisito relacionado:\*\* CA20 e RN05.



\### 5. Utilização do relógio da máquina no cálculo da data de devolução



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan` (na criação do objeto `loan`, propriedade `dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`).

\* \*\*Descrição do problema:\*\* O cálculo da data prevista de devolução faz o uso direto do relógio do sistema (`new Date()`) em vez de utilizar a data base fornecida na operação (`currentDate`).

\* \*\*Comportamento esperado:\*\* A data de devolução deve ser calculada acrescentando-se 14 dias à data do empréstimo (recebida pelo sistema/controlável via testes).

\* \*\*Comportamento atual:\*\* O cálculo desconsidera a data passada à operação e usa a data física do sistema, inviabilizando testes com controle de tempo e gerando inconsistência com a data do empréstimo (`loanDate`).

\* \*\*Requisito relacionado:\*\* CA15 e RNF01.

