\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*3 defeitos funcionais\*\* em `renewLoan` (`src/loans/loan.service.js`).



\---



\## Defeito 1: Data prevista calculada a partir da data da operação, não da data prevista atual



\*\*Localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\*\*Descrição do problema:\*\* Os 7 dias são somados à data da operação (`currentDate`), e não à data prevista atual do empréstimo (`loan.dueDate`).



\*\*Comportamento esperado:\*\* Nova data prevista = data prevista atual + 7 dias. Exemplo: previsto para 15/10, renovação feita em 09/10, nova data = 22/10.



\*\*Comportamento atual:\*\* Nova data = data da operação + 7 dias. No exemplo acima, resulta em 16/10, ou seja, a renovação \*\*reduz\*\* o prazo (de 15/10 para 16/10 ainda é praticamente igual, e em outros casos o prazo diminui ou o usuário perde dias já concedidos).



\*\*Requisito relacionado:\*\* RF06 / CA27, RN02.



\---



\## Defeito 2: Mutação do empréstimo antes da validação do limite de renovações



\*\*Localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, a atribuição `loan.dueDate = ...` ocorre \*\*antes\*\* do `if (loan.renewalCount >= 3) throw ...`.



\*\*Descrição do problema:\*\* A data prevista é alterada no objeto `loan` antes de a regra do limite de renovações ser verificada. Quando a renovação é rejeitada com `RENEWAL\_LIMIT\_REACHED`, o objeto já foi modificado em memória.



\*\*Comportamento esperado:\*\* Uma renovação rejeitada não altera data nem contador; toda validação deve ocorrer antes de qualquer modificação.



\*\*Comportamento atual:\*\* O erro é lançado, mas o objeto `loan` já teve a `dueDate` alterada. Dependendo do repositório (por exemplo, um repositório em memória que devolve a referência do objeto armazenado), a data prevista fica \*\*alterada de fato\*\* mesmo com a rejeição, o que viola a regra de que operações rejeitadas não alteram dados.



\*\*Requisito relacionado:\*\* CA32, RN08, CA31, RN03.



\---



\## Defeito 3: Empréstimo com data prevista igual à data da operação é tratado como atrasado



\*\*Localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, condição `if (loan.dueDate <= operationDate)`.



\*\*Descrição do problema:\*\* A comparação usa `<=`, mas um empréstimo só está atrasado quando a data prevista é \*\*estritamente anterior\*\* à data da operação.



\*\*Comportamento esperado:\*\* Se `dueDate === operationDate`, o empréstimo \*\*não\*\* está atrasado e a renovação deve ser permitida (rejeitar apenas quando `dueDate < operationDate`).



\*\*Comportamento atual:\*\* No dia do vencimento, a renovação é rejeitada com `OVERDUE\_LOAN`, impedindo a renovação de um empréstimo que ainda não está atrasado.



\*\*Requisito relacionado:\*\* RN07, CA30.



\---



\## Pontos verificados sem defeito



\- \*\*CA28:\*\* o contador é incrementado em 1 (`renewalCount += 1`), corretamente após as validações.

\- \*\*CA29:\*\* a quantidade disponível não é alterada pela lógica de renovação, supondo que `persistLoan` apenas salve o livro sem mexer em `availableQuantity`. Não é possível confirmar isso só pelo diff, pois o corpo de `persistLoan` não foi mostrado.

\- \*\*CA31:\*\* o limite de 3 renovações é verificado com `>= 3`, o que rejeita a quarta renovação, embora a ordem das operações cause o Defeito 2.

