\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*3 defeitos funcionais\*\* em `renewLoan`, em `src/loans/loan.service.js`.



\---



\## Defeito 1: Data prevista calculada a partir da data da operação, não da data prevista atual



\*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\*\*Descrição do problema:\*\* Os 7 dias são somados à `currentDate` (data da operação), e não à `loan.dueDate` (data prevista atual).



\*\*Comportamento esperado:\*\* Nova data prevista = data prevista atual + 7 dias. Exemplo: prevista em 20/10 → renovada em 10/10 → nova data 27/10.



\*\*Comportamento atual:\*\* Nova data prevista = data da operação + 7 dias. No exemplo acima, a nova data seria 17/10, \*\*encurtando\*\* o prazo do empréstimo. Renovar com antecedência sempre prejudica o usuário, e o resultado varia conforme o dia em que a renovação é feita.



\*\*Requisito relacionado:\*\* CA27, RN02.



\---



\## Defeito 2: Verificação de atraso rejeita empréstimos que vencem no dia da operação



\*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`.



\*\*Descrição do problema:\*\* A comparação usa `<=`, mas a regra define atraso apenas quando a data prevista é \*\*anterior\*\* à data da operação (`<`).



\*\*Comportamento esperado:\*\* Um empréstimo com data prevista igual à data da operação \*\*não\*\* está atrasado e pode ser renovado.



\*\*Comportamento atual:\*\* Nesse caso o sistema lança `OVERDUE\_LOAN` (409) e recusa a renovação, tratando como atrasado um empréstimo que vence hoje.



\*\*Requisito relacionado:\*\* CA30, RN07.



\---



\## Defeito 3: Mutação do objeto antes da validação do limite de renovações



\*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, ordem entre `loan.dueDate = ...` e `if (loan.renewalCount >= 3)`.



\*\*Descrição do problema:\*\* A data prevista é alterada no objeto `loan` \*\*antes\*\* de verificar o limite de três renovações. Quando a quarta renovação é rejeitada, o objeto em memória já foi modificado.



\*\*Comportamento esperado:\*\* Uma renovação rejeitada não altera data nem contador. Todas as validações devem ocorrer antes de qualquer modificação do estado.



\*\*Comportamento atual:\*\* A exceção `RENEWAL\_LIMIT\_REACHED` é lançada, mas `loan.dueDate` já foi alterado. Se o repositório devolver a mesma referência de objeto (por exemplo, um repositório em memória), a data modificada permanece no sistema mesmo com a rejeição. Mesmo que `persistLoan` não seja chamado, o estado fica corrompido nesse cenário.



\*\*Requisito relacionado:\*\* CA31, CA32, RN03, RN08.



\---



\## Pontos verificados sem defeito



\- \*\*CA28:\*\* o contador aumenta em 1 corretamente.

\- \*\*CA29:\*\* a quantidade disponível do livro não é alterada pela renovação (o livro é apenas passado a `persistLoan`, e vale confirmar que essa função não mexe em `availableQuantity` neste fluxo).

\- \*\*Limite de renovações:\*\* `renewalCount >= 3` rejeita corretamente a quarta renovação.

