Aqui estão os defeitos funcionais encontrados no Pull Request com base nas regras de negócio fornecidas:



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js`, na linha `loan.dueDate = formatDate(addDays(currentDate, 7));`

\* \*\*Descrição do problema:\*\* O cálculo da nova data de devolução está utilizando a data atual da operação (`currentDate`) como data base para a adição de dias, ignorando a data de vencimento atual do empréstimo.

\* \*\*Comportamento esperado:\*\* A renovação deve somar 7 dias à \*\*data prevista atual\*\* do empréstimo (que seria `loan.dueDate`).

\* \*\*Comportamento atual:\*\* O sistema está definindo a nova data adicionando 7 dias à data em que a ação de renovar está sendo realizada.

\* \*\*Requisito relacionado:\*\* CA27 ("Cada renovação deve acrescentar 7 dias à data prevista atual.") e RN02.



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js`, na linha `if (loan.dueDate <= operationDate)`

\* \*\*Descrição do problema:\*\* A validação que impede a renovação de empréstimos atrasados está usando o operador menor ou igual (`<=`). Dessa forma, se a operação ocorrer no dia exato do vencimento (`loan.dueDate === operationDate`), o empréstimo será incorretamente classificado como atrasado.

\* \*\*Comportamento esperado:\*\* Um empréstimo só deve ser bloqueado por atraso quando sua data prevista for estritamente anterior (`<`) à data da operação. Renovações feitas no dia do vencimento devem ser aceitas.

\* \*\*Comportamento atual:\*\* O sistema bloqueia indevidamente a renovação de empréstimos que estão vencendo no dia da operação.

\* \*\*Requisito relacionado:\*\* RN07 ("Um empréstimo está atrasado quando a data prevista é anterior à data da operação.") e CA30.



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js`, alteração em `loan.dueDate` ocorrendo imediatamente antes do bloco `if (loan.renewalCount >= 3)`

\* \*\*Descrição do problema:\*\* O objeto do empréstimo sofre mutação (tem sua data alterada) antes de todas as validações de recusa serem concluídas. Caso o limite de renovações seja excedido, uma exceção é lançada depois da mutação. Dependendo do comportamento interno do ORM (como \*auto-flush\* de entidades gerenciadas na sessão), a modificação pode vazar ou ser salva.

\* \*\*Comportamento esperado:\*\* A entidade não deve sofrer nenhum tipo de modificação de estado até que se comprove que a renovação não será rejeitada. A validação do limite de renovações deve ocorrer \*antes\* de atualizar a propriedade `dueDate`.

\* \*\*Comportamento atual:\*\* A data prevista (`dueDate`) do empréstimo é modificada (em memória) antes da operação ser rejeitada por ter atingido o limite máximo de renovações.

\* \*\*Requisito relacionado:\*\* CA32 ("Uma renovação rejeitada não deve modificar a data nem o contador.") e RN08.

