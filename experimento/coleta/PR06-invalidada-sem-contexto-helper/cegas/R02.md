Abaixo estão os defeitos funcionais identificados no Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\### Defeito 1: Bloqueio indevido de renovação no dia do vencimento



\* \*\*Localização:\*\* `src/loans/loan.service.js`, linha 125 (`if (loan.dueDate <= operationDate)`)

\* \*\*Descrição do problema:\*\* A verificação considera um empréstimo como atrasado mesmo se a operação for realizada no dia exato do vencimento, utilizando o operador menor ou igual (`<=`).

\* \*\*Comportamento esperado:\*\* Um empréstimo só deve ser considerado atrasado se a data prevista for estritamente anterior (`<`) à data da operação.

\* \*\*Comportamento atual:\*\* O sistema rejeita a renovação de empréstimos (lançando a exceção `OVERDUE\_LOAN`) no dia do seu vencimento.

\* \*\*Requisito relacionado:\*\* CA30 e RN07.



\### Defeito 2: Cálculo incorreto da nova data de devolução



\* \*\*Localização:\*\* `src/loans/loan.service.js`, linha 128 (`loan.dueDate = formatDate(addDays(currentDate, 7));`)

\* \*\*Descrição do problema:\*\* O acréscimo de dias está utilizando a data da operação (`currentDate`) como base para calcular a nova data.

\* \*\*Comportamento esperado:\*\* A renovação deve acrescentar os 7 dias à data prevista atual do empréstimo (`loan.dueDate`).

\* \*\*Comportamento atual:\*\* O sistema está somando 7 dias à data em que a ação foi realizada, encurtando o tempo total de empréstimo caso o usuário renove antes da data de vencimento.

\* \*\*Requisito relacionado:\*\* CA27 e RN02.



\### Defeito 3: Mutação de dados antes da validação da regra de limite de renovações



\* \*\*Localização:\*\* `src/loans/loan.service.js`, linhas 128 a 132

\* \*\*Descrição do problema:\*\* A atribuição de uma nova data ao objeto (`loan.dueDate = ...`) ocorre antes de verificar se o empréstimo já atingiu o limite máximo de renovações.

\* \*\*Comportamento esperado:\*\* As regras de negócio e limites devem ser validadas antes de se modificar o estado do objeto do empréstimo, garantindo que operações rejeitadas não deixem rastros (modificações em memória) que possam causar efeitos colaterais.

\* \*\*Comportamento atual:\*\* A data prevista do objeto `loan` é modificada em memória e, logo em seguida, o sistema lança um erro `RENEWAL\_LIMIT\_REACHED`. Dependendo do comportamento do ORM na transação, isso pode resultar em persistência acidental da nova data sem alterar o contador.

\* \*\*Requisito relacionado:\*\* CA32 e RN08.

