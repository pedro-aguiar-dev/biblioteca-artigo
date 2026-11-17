Aqui estão os defeitos funcionais identificados no Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `createLoan`)

\* \*\*Descrição do problema:\*\* A quantidade disponível do livro (`book.availableCopies -= 1`) é reduzida antes de várias validações (limite de empréstimos, atrasos, livro duplicado). Se qualquer uma dessas validações subsequentes falhar, uma exceção é lançada antes de entrar na transação (`runInTransaction`), fazendo com que a redução permaneça na memória sem ser revertida.

\* \*\*Comportamento esperado:\*\* A operação de redução da quantidade disponível não deve alterar os dados do sistema quando a operação for rejeitada por falha de validação.

\* \*\*Comportamento atual:\*\* Quando um empréstimo é rejeitado nas validações posteriores à redução, a cópia do livro é descontada do inventário indevidamente, não preservando a quantidade disponível.

\* \*\*Requisito relacionado:\*\* CA21 e RN08.



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `createLoan`)

\* \*\*Descrição do problema:\*\* Para verificar o limite máximo de empréstimos, o código está utilizando `this.loanRepository.findByUser(userId)`, que retorna o histórico completo de empréstimos do usuário.

\* \*\*Comportamento esperado:\*\* A validação deve verificar se o usuário já possui três empréstimos \*em aberto\*.

\* \*\*Comportamento atual:\*\* O sistema impede o empréstimo se o usuário tiver um histórico de três ou mais empréstimos no total, mesmo que já os tenha devolvido.

\* \*\*Requisito relacionado:\*\* CA19 e RN04.



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `createLoan`)

\* \*\*Descrição do problema:\*\* Na verificação de empréstimos atrasados, o código usa a condição `loan.dueDate <= operationDate`.

\* \*\*Comportamento esperado:\*\* Um empréstimo só deve ser considerado atrasado quando a data prevista é estritamente anterior à data da operação (`<`).

\* \*\*Comportamento atual:\*\* Empréstimos que estão no prazo, mas vencem no dia exato da operação (`=`), estão sendo indevidamente contabilizados como atrasados e impedindo novos empréstimos.

\* \*\*Requisito relacionado:\*\* RN07.



\### Defeito 4



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `createLoan`)

\* \*\*Descrição do problema:\*\* A validação para impedir que o usuário empreste um livro que já possui utiliza o método `findByUserAndBook`, que busca em todo o histórico.

\* \*\*Comportamento esperado:\*\* A operação deve ser rejeitada apenas se o usuário possuir o mesmo livro \*em aberto\* (sem devolução). O código deveria utilizar `findOpenByUserAndBook`.

\* \*\*Comportamento atual:\*\* A operação é rejeitada se o usuário já tiver emprestado o mesmo livro no passado, mesmo que já tenha sido devolvido.

\* \*\*Requisito relacionado:\*\* CA20 e RN05.



\### Defeito 5



\* \*\*Localização:\*\* `src/loans/loan.service.js` (método `createLoan`, construção do objeto `loan`)

\* \*\*Descrição do problema:\*\* O cálculo da data prevista (`dueDate`) está utilizando o horário atual da máquina através de `new Date()`.

\* \*\*Comportamento esperado:\*\* A data de devolução deve ser calculada adicionando 14 dias à data da operação (`currentDate`), que é fornecida e controlável (especialmente para os testes).

\* \*\*Comportamento atual:\*\* A data de devolução é fixada com base no relógio da máquina (`new Date()`), o que gera inconsistência com a `loanDate` informada, violando a exigência de ser controlável nos testes.

\* \*\*Requisito relacionado:\*\* CA15 e RNF01.

