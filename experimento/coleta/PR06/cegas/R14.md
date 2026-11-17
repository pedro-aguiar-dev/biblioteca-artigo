\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*4 defeitos\*\* funcionais em `renewLoan` (`src/loans/loan.service.js`).



\---



\## Defeito 1: Data prevista calculada a partir da data da operação, e não da data prevista atual



\- \*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`

\- \*\*Descrição do problema:\*\* Os 7 dias são somados à data da operação (`currentDate`), e não à data prevista atual do empréstimo (`loan.dueDate`).

\- \*\*Comportamento esperado:\*\* Nova data prevista = data prevista atual + 7 dias. Exemplo: prevista em 20/10, renovação em 10/10, nova data 27/10.

\- \*\*Comportamento atual:\*\* Nova data prevista = data da operação + 7 dias. No mesmo exemplo, o resultado é 17/10, ou seja, a renovação \*\*reduz\*\* o prazo.

\- \*\*Requisito relacionado:\*\* CA27, RN02.



\---



\## Defeito 2: Atraso detectado com comparação incorreta (`<=` em vez de `<`)



\- \*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`.

\- \*\*Descrição do problema:\*\* O empréstimo é tratado como atrasado quando a data prevista é \*\*igual\*\* à data da operação.

\- \*\*Comportamento esperado:\*\* Atrasado somente quando a data prevista é \*\*anterior\*\* à data da operação. Se a data prevista é hoje, o empréstimo ainda pode ser renovado.

\- \*\*Comportamento atual:\*\* Renovação feita no próprio dia do vencimento é rejeitada com `OVERDUE\_LOAN`.

\- \*\*Requisito relacionado:\*\* CA30, RN07.



\---



\## Defeito 3: Alteração do objeto antes de validar o limite de renovações



\- \*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, atribuição de `loan.dueDate` feita \*\*antes\*\* da verificação `loan.renewalCount >= 3`.

\- \*\*Descrição do problema:\*\* A data prevista é modificada no objeto em memória antes de a regra de limite ser verificada. Quando a quarta renovação é rejeitada, o objeto `loan` já foi alterado.

\- \*\*Comportamento esperado:\*\* Uma renovação rejeitada não deve modificar a data nem o contador. Todas as validações devem ocorrer antes de qualquer mutação.

\- \*\*Comportamento atual:\*\* A quarta renovação é rejeitada, mas `loan.dueDate` já foi alterado. Dependendo da implementação do repositório (por exemplo, repositório em memória que devolve a mesma referência do objeto), a nova data fica efetivamente persistida mesmo com o erro `RENEWAL\_LIMIT\_REACHED`.

\- \*\*Requisito relacionado:\*\* CA32, RN08.



\---



\## Defeito 4: Renovação decrementa a quantidade disponível do livro



\- \*\*Localização:\*\* `src/loans/loan.service.js`, `renewLoan`, retorno `return this.persistLoan(loan, book);`.

\- \*\*Descrição do problema:\*\* `persistLoan` foi escrito para a criação de empréstimos e executa `book.availableCopies -= 1` e salva o livro. Reutilizá-lo na renovação aplica esse decremento indevidamente.

\- \*\*Comportamento esperado:\*\* A quantidade disponível permanece inalterada na renovação.

\- \*\*Comportamento atual:\*\* Cada renovação diminui `availableCopies` em 1, podendo esgotar o estoque e até torná-lo negativo.

\- \*\*Requisito relacionado:\*\* CA29.



\---



\## Observações



\- A verificação `renewalCount >= 3` está correta quanto ao limite (RN03, CA31); o problema é apenas a ordem em relação à mutação (Defeito 3).

\- A rejeição de empréstimos já devolvidos (`LOAN\_ALREADY\_RETURNED`) é coerente com o conceito de "empréstimo em aberto" do RF06.

\- A correção natural é: validar tudo primeiro, depois fazer `loan.dueDate = addDays(loan.dueDate, 7)` e `loan.renewalCount += 1`, e salvar apenas o empréstimo, sem tocar no livro.

