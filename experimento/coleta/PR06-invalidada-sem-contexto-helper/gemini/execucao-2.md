Aqui estão os defeitos funcionais identificados no Pull Request com base nos requisitos e regras de negócio fornecidos:



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js`, na validação `if (loan.dueDate <= operationDate)`

\* \*\*Descrição do problema:\*\* A lógica para verificar empréstimos atrasados está incorreta. O uso do operador menor ou igual (`<=`) rejeitará a renovação caso a data prevista seja exatamente igual à data da operação. A regra determina que o atraso ocorre apenas quando a data prevista é \*anterior\* à data da operação.

\* \*\*Comportamento esperado:\*\* O sistema deve permitir a renovação se a data prevista (`dueDate`) for igual à data da operação (`operationDate`).

\* \*\*Comportamento atual:\*\* O sistema lança o erro `OVERDUE\_LOAN` mesmo quando a data prevista é igual à data da operação.

\* \*\*Requisito relacionado:\*\* CA30 e RN07 ("anterior à data da operação").



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js`, na linha `loan.dueDate = formatDate(addDays(currentDate, 7));`

\* \*\*Descrição do problema:\*\* O acréscimo de 7 dias para calcular a nova data de devolução está sendo feito sobre a data atual da operação (`currentDate`). A regra de negócio exige que o acréscimo seja feito sobre a data prevista \*atual\* do empréstimo.

\* \*\*Comportamento esperado:\*\* A nova data de devolução deve ser calculada somando 7 dias a `loan.dueDate`.

\* \*\*Comportamento atual:\*\* A nova data de devolução é calculada somando 7 dias a `currentDate` (a data informada na requisição).

\* \*\*Requisito relacionado:\*\* CA27 e RN02 ("acrescentar 7 dias à data prevista atual").



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js`, na atribuição `loan.dueDate = formatDate(...)` posicionada antes da validação `if (loan.renewalCount >= 3)`

\* \*\*Descrição do problema:\*\* A modificação do estado do empréstimo (`loan.dueDate`) está acontecendo em memória \*antes\* da validação do limite de renovações. Caso a renovação seja rejeitada pelo limite ter sido atingido, o objeto já terá sua data modificada incorretamente durante a execução daquela requisição.

\* \*\*Comportamento esperado:\*\* Nenhuma modificação deve ser feita no objeto do empréstimo antes de garantir que todas as regras de validação para a operação passem. A checagem do contador de renovações deve ocorrer antes de modificar `loan.dueDate`.

\* \*\*Comportamento atual:\*\* A data (`loan.dueDate`) é modificada no objeto em memória e, em seguida, a operação pode ser rejeitada pelo limite de renovações (`RENEWAL\_LIMIT\_REACHED`).

\* \*\*Requisito relacionado:\*\* CA32 e RN08 ("Uma renovação rejeitada não deve modificar a data").

