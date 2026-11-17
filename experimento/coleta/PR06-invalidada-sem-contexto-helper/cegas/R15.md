Aqui estão os defeitos funcionais encontrados na análise do Pull Request, com base nas regras de negócio fornecidas:



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js` (Método `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`)

\* \*\*Descrição do problema:\*\* O cálculo da nova data prevista está utilizando a data da operação (`currentDate`) como base, em vez de utilizar a data prevista atual do empréstimo (`loan.dueDate`).

\* \*\*Comportamento esperado:\*\* A nova data prevista deve ser calculada adicionando-se 7 dias à data prevista atual do empréstimo.

\* \*\*Comportamento atual:\*\* A nova data prevista está sendo calculada adicionando-se 7 dias à data em que a operação está sendo realizada.

\* \*\*Requisito relacionado:\*\* CA27 e RN02 (\*Cada renovação deve acrescentar 7 dias à data prevista atual\*).



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js` (Método `renewLoan`, linha `if (loan.dueDate <= operationDate)`)

\* \*\*Descrição do problema:\*\* A validação que impede a renovação de empréstimos atrasados está muito restritiva. O uso do operador `<=` considera como atrasado um empréstimo cuja data prevista é igual à data da operação (o dia do vencimento).

\* \*\*Comportamento esperado:\*\* O sistema deve considerar o empréstimo atrasado e impedir a renovação apenas se a data prevista for estritamente anterior (`<`) à data da operação.

\* \*\*Comportamento atual:\*\* O sistema rejeita a renovação de empréstimos que vencem no exato dia da operação, bloqueando operações legítimas.

\* \*\*Requisito relacionado:\*\* CA30 e RN07 (\*Um empréstimo está atrasado quando a data prevista é anterior à data da operação\*).



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js` (Método `renewLoan`, linhas onde `loan.dueDate` é alterada antes da validação `if (loan.renewalCount >= 3)`)

\* \*\*Descrição do problema:\*\* O estado do objeto `loan` (`dueDate`) está sendo alterado em memória antes da validação do limite máximo de renovações. Embora a alteração não seja persistida no banco de dados (já que a exceção interrompe o fluxo antes do `persistLoan`), o objeto é mutado prematuramente. Caso a instância seja reaproveitada pelo framework, cache ou logs após o erro, ela estará com uma data incorreta.

\* \*\*Comportamento esperado:\*\* O sistema deve validar todas as regras de negócio (incluindo o limite de renovações) antes de aplicar qualquer modificação ao estado do empréstimo.

\* \*\*Comportamento atual:\*\* A data prevista do empréstimo é modificada em memória e, logo em seguida, a operação pode ser rejeitada pela validação de limite de renovações.

\* \*\*Requisito relacionado:\*\* CA32 e RN08 (\*Uma renovação rejeitada não deve modificar a data nem o contador / Uma operação rejeitada não pode modificar os dados do sistema\*).

