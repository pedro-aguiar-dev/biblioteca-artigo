\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*4 defeitos funcionais\*\* em `renewLoan` (`src/loans/loan.service.js`).



\---



\## Defeito 1: Cálculo da nova data prevista ignora a data prevista atual



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\*\*Descrição do problema:\*\* O prazo é calculado a partir da data da operação (`currentDate`), e não da data prevista atual do empréstimo.



\*\*Comportamento esperado:\*\* Nova data prevista = data prevista atual + 7 dias. Ex.: prevista em 20/10, renovação em 10/10, nova data 27/10.



\*\*Comportamento atual:\*\* Nova data = data da operação + 7 dias. No exemplo, a nova data seria 17/10, ou seja, a renovação \*\*reduz\*\* o prazo do usuário.



\*\*Requisito relacionado:\*\* CA27, RN02.



\---



\## Defeito 2: Empréstimo com vencimento no dia da operação é tratado como atrasado



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`.



\*\*Descrição do problema:\*\* A comparação usa `<=`, mas a regra define atraso apenas quando a data prevista é \*\*anterior\*\* à data da operação.



\*\*Comportamento esperado:\*\* Se a data prevista for igual à data da operação, o empréstimo não está atrasado e pode ser renovado.



\*\*Comportamento atual:\*\* Renovação feita no próprio dia do vencimento é rejeitada com `OVERDUE\_LOAN`.



\*\*Requisito relacionado:\*\* RN07, CA30.



\---



\## Defeito 3: Dado do empréstimo é alterado antes da validação do limite de renovações



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, atribuição `loan.dueDate = ...` anterior ao `if (loan.renewalCount >= 3)`.



\*\*Descrição do problema:\*\* A data prevista é modificada no objeto `loan` antes de a validação do limite de renovações rejeitar a operação. Dependendo do repositório (por exemplo, um repositório em memória que devolve a mesma referência do objeto armazenado), a mutação já atinge o estado persistido, mesmo com a operação rejeitada.



\*\*Comportamento esperado:\*\* Uma renovação rejeitada (quarta tentativa) não altera data nem contador. Todas as validações devem ocorrer antes de qualquer modificação.



\*\*Comportamento atual:\*\* Na quarta renovação, a exceção é lançada, mas `dueDate` já foi alterado no objeto em memória, o que pode corromper o dado.



\*\*Requisito relacionado:\*\* CA32, RN08.



\---



\## Defeito 4: Falta de validação da existência do livro e ausência de transação adequada na persistência



\*\*Localização:\*\* `loan.service.js`, final de `renewLoan`: `return this.persistLoan(loan, book);`



\*\*Descrição do problema:\*\* A renovação reutiliza `persistLoan`, que executa `book.availableCopies -= 1`. Isso é feito para criar um empréstimo, não para renová-lo.



\*\*Comportamento esperado:\*\* A renovação deve salvar apenas o empréstimo atualizado (data prevista e contador), mantendo a quantidade disponível do livro inalterada.



\*\*Comportamento atual:\*\* Cada renovação decrementa em 1 a quantidade disponível do livro. Após três renovações, 3 exemplares ficam indevidamente indisponíveis. Além disso, se o livro não for encontrado, `book` será nulo e ocorrerá erro não tratado ao acessar `availableCopies`.



\*\*Requisito relacionado:\*\* CA29.



\---



\## Resumo



| # | Defeito | Requisito |

|---|---------|-----------|

| 1 | Nova data calculada a partir da data da operação | CA27, RN02 |

| 2 | `<=` em vez de `<` na checagem de atraso | RN07, CA30 |

| 3 | Mutação de `dueDate` antes da validação do limite | CA32, RN08 |

| 4 | `persistLoan` decrementa a quantidade disponível | CA29 |



O limite de 3 renovações (`renewalCount >= 3`) e o incremento do contador estão corretos em relação a CA28, CA31 e RN03.

