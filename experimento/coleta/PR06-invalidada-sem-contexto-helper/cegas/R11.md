\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*3 defeitos\*\*.



\---



\## Defeito 1: Data prevista calculada a partir da data da operação, não da data prevista atual



\*\*Localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\*\*Descrição do problema:\*\* Os 7 dias são somados à `currentDate` (data da operação) em vez de à `loan.dueDate` (data prevista atual do empréstimo).



\*\*Comportamento esperado:\*\* Nova data prevista = data prevista atual + 7 dias. Exemplo: prevista em 20/10 → após renovar, 27/10, independentemente do dia em que a renovação for feita.



\*\*Comportamento atual:\*\* Nova data prevista = data da operação + 7 dias. Exemplo: prevista em 20/10, renovação feita em 09/10 → nova data 16/10, ou seja, o prazo \*\*diminui\*\*. Em renovações sucessivas, o resultado depende do dia em que foram feitas, e não do acréscimo cumulativo de 7 dias.



\*\*Requisito relacionado:\*\* RF06, CA27, RN02.



\---



\## Defeito 2: Rejeição por limite de renovações ocorre após a mutação da data prevista



\*\*Localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, ordem entre `loan.dueDate = ...` e `if (loan.renewalCount >= 3) throw ...`



\*\*Descrição do problema:\*\* A data prevista é alterada no objeto `loan` antes da validação do limite de renovações. Quando a validação falha e a exceção é lançada, o objeto já foi modificado.



\*\*Comportamento esperado:\*\* Uma renovação rejeitada (quarta tentativa) não altera data nem contador. Todas as validações devem ocorrer antes de qualquer alteração no estado.



\*\*Comportamento atual:\*\* Na quarta renovação, a exceção `RENEWAL\_LIMIT\_REACHED` é lançada, mas `loan.dueDate` já foi alterado. A persistência não é chamada, então o efeito depende do repositório: se `findById` devolver uma referência ao objeto armazenado (por exemplo, repositório em memória), a alteração da data \*\*permanece\*\* nos dados do sistema, violando a regra. Em um repositório que devolve cópias, o defeito fica latente, mas a ordem das operações continua incorreta e frágil.



\*\*Requisito relacionado:\*\* CA32, RN08.



\---



\## Defeito 3: Empréstimo com data prevista igual à data da operação é tratado como atrasado



\*\*Localização:\*\* `src/loans/loan.service.js`, método `renewLoan`, condição `if (loan.dueDate <= operationDate)`



\*\*Descrição do problema:\*\* A comparação usa `<=`, rejeitando também o caso em que a data prevista é igual à data da operação.



\*\*Comportamento esperado:\*\* Um empréstimo só está atrasado quando a data prevista é \*\*estritamente anterior\*\* à data da operação (`dueDate < operationDate`). No dia do vencimento, o empréstimo ainda não está atrasado e deve poder ser renovado.



\*\*Comportamento atual:\*\* Renovação feita exatamente na data prevista é rejeitada com `OVERDUE\_LOAN` (409), embora o empréstimo não esteja atrasado.



\*\*Requisito relacionado:\*\* RN07, CA30 (e RF06, que permite renovar empréstimos em aberto não atrasados).



\---



\## Pontos verificados sem defeito



\- CA29 (quantidade disponível inalterada): a renovação não altera estoque no trecho exibido; depende de `persistLoan` não alterar `availableQuantity`, o que está fora do diff.

\- Rejeição de empréstimo já devolvido, empréstimo inexistente e entradas inválidas está tratada e ocorre antes de qualquer mutação.

\- Incremento do contador (CA28) está correto quando a renovação é aceita.

