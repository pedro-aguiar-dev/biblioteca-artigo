\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*3 defeitos funcionais\*\*, todos em `src/loans/loan.service.js`, método `renewLoan`.



\---



\## Defeito 1: Data prevista calculada a partir da data atual, não da data prevista



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\*\*Descrição do problema:\*\* O novo prazo é calculado somando 7 dias à data da operação (`currentDate`), e não à data prevista atual do empréstimo (`loan.dueDate`).



\*\*Comportamento esperado:\*\* Somar 7 dias à data prevista atual. Exemplo: data prevista 2026-10-15 e renovação em 2026-10-09 resulta em 2026-10-22.



\*\*Comportamento atual:\*\* O resultado é 2026-10-16 (data da operação + 7). O usuário perde dias já concedidos sempre que renova antes do vencimento, e a regra só coincidiria com a esperada se a renovação ocorresse exatamente no dia do vencimento (o que, aliás, é bloqueado pelo defeito 2).



\*\*Requisito relacionado:\*\* CA27, RN02.



\---



\## Defeito 2: Empréstimo que vence no dia da operação é tratado como atrasado



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`.



\*\*Descrição do problema:\*\* A comparação usa `<=`, rejeitando também o caso em que a data prevista é igual à data da operação.



\*\*Comportamento esperado:\*\* Um empréstimo só está atrasado quando a data prevista é \*\*anterior\*\* à data da operação (`loan.dueDate < operationDate`). No dia do vencimento, a renovação deve ser permitida.



\*\*Comportamento atual:\*\* Renovar no próprio dia de vencimento retorna `OVERDUE\_LOAN` (409), embora o empréstimo não esteja atrasado.



\*\*Requisito relacionado:\*\* RN07, CA30.



\---



\## Defeito 3: Mutação do objeto antes da validação do limite de renovações



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, atribuição `loan.dueDate = ...` anterior ao `if (loan.renewalCount >= 3)`.



\*\*Descrição do problema:\*\* A data prevista é alterada no objeto `loan` antes de a regra de limite de renovações ser verificada. Quando a quarta renovação é rejeitada, o objeto já foi modificado em memória. Se o repositório devolver a mesma referência que mantém internamente (por exemplo, repositório em memória ou cache), a alteração fica persistida mesmo sem chamada a `persistLoan`.



\*\*Comportamento esperado:\*\* Uma renovação rejeitada não altera data nem contador; todas as validações devem ocorrer antes de qualquer modificação do empréstimo.



\*\*Comportamento atual:\*\* Na quarta tentativa, `RENEWAL\_LIMIT\_REACHED` é lançado, mas `loan.dueDate` já foi alterado. Dependendo da implementação do repositório, a data prevista muda em uma operação rejeitada.



\*\*Requisito relacionado:\*\* CA32, CA31, RN08, RN03.



\---



\## Pontos verificados sem defeito



\- \*\*CA28\*\* (contador +1): `renewalCount += 1` está correto.

\- \*\*CA29\*\* (quantidade disponível inalterada): o livro é apenas repassado a `persistLoan`, sem alterar o estoque nesta função. Vale confirmar que `persistLoan` não mexe em `availableQuantity`, mas isso não faz parte do diff.

\- \*\*CA31/RN03\*\* (limite): `renewalCount >= 3` rejeita corretamente a quarta renovação (a ordem da verificação é o problema, tratado no defeito 3).

\- Rejeição de empréstimo já devolvido, ID inexistente e entrada inválida está coerente com RN08.

