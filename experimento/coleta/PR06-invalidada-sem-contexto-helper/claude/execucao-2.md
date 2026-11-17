Encontrei três defeitos funcionais no PR, todos em `renewLoan` (`src/loans/loan.service.js`).



\---



\## Defeito 1: Data prevista calculada a partir da data da operação, e não da data prevista atual



\*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\*\*Descrição do problema:\*\* Os 7 dias são somados à `currentDate` (data da operação) em vez de à `loan.dueDate` atual.



\*\*Comportamento esperado:\*\* A nova data prevista deve ser a data prevista atual + 7 dias. Exemplo: com `dueDate = 2026-10-20` e renovação em `2026-10-09`, o resultado deve ser `2026-10-27`.



\*\*Comportamento atual:\*\* O resultado é `2026-10-16` (data da operação + 7). O usuário perde dias já contratados, e renovar antecipadamente encurta o prazo em vez de estendê-lo. Se a renovação for feita um dia antes do vencimento, o ganho será de apenas 8 dias sobre o `dueDate` original, em vez de 7 a partir dele, e em qualquer outro cenário o valor diverge.



\*\*Requisitos relacionados:\*\* CA27, RN02.



\---



\## Defeito 2: Alteração do objeto antes da validação do limite de renovações (renovação rejeitada altera dados)



\*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, ordem entre `loan.dueDate = ...` e `if (loan.renewalCount >= 3) throw ...`



\*\*Descrição do problema:\*\* A atribuição de `loan.dueDate` ocorre antes da verificação do limite de renovações. Quando a quarta renovação é rejeitada, o objeto `loan` já foi mutado.



\*\*Comportamento esperado:\*\* Uma renovação rejeitada não deve alterar data nem contador. Todas as validações devem ocorrer antes de qualquer modificação.



\*\*Comportamento atual:\*\* A exceção `RENEWAL\_LIMIT\_REACHED` é lançada, mas `loan.dueDate` já foi alterado em memória. Dependendo do repositório (por exemplo, um repositório em memória que devolve a mesma referência do objeto, como é comum em implementações com `Map` ou array), a data prevista fica modificada mesmo com a rejeição. Mesmo que um repositório com cópia mascare o problema, o código é incorreto e frágil quanto ao requisito.



\*\*Requisitos relacionados:\*\* CA32, RN08.



\---



\## Defeito 3: Empréstimo que vence na própria data da operação é tratado como atrasado



\*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`



\*\*Descrição do problema:\*\* A comparação usa `<=`, enquanto a regra define atraso apenas quando a data prevista é \*\*anterior\*\* à data da operação.



\*\*Comportamento esperado:\*\* Só deve ser rejeitado com `OVERDUE\_LOAN` se `loan.dueDate < operationDate`. Um empréstimo cujo vencimento é hoje ainda não está atrasado e deve poder ser renovado.



\*\*Comportamento atual:\*\* Um empréstimo com `dueDate` igual à data da operação é rejeitado como atrasado, impedindo uma renovação legítima no último dia do prazo.



\*\*Requisitos relacionados:\*\* CA30, RN07.



\---



\## Observação



Não identifiquei defeitos relacionados a CA28 (contador incrementado em 1), CA29 (disponibilidade não alterada, já que apenas `persistLoan` é chamado com o livro sem alterar `availableQuantity` neste trecho) nem à validação do limite `>= 3` em si (RN03/CA31), que está correta quanto à condição, apesar da ordem inadequada apontada no Defeito 2. Como o corpo de `persistLoan` não está no diff, assumi que ele apenas persiste os dados sem alterar a quantidade disponível.

