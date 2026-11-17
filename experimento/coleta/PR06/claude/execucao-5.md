\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*4 defeitos funcionais\*\* em `renewLoan`, todos em `src/loans/loan.service.js`.



\---



\## Defeito 1: Data prevista calculada a partir da data da operação



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\*\*Descrição do problema:\*\* O acréscimo de 7 dias é aplicado sobre `currentDate` (data da operação) e não sobre a data prevista atual do empréstimo.



\*\*Comportamento esperado:\*\* A nova data prevista é `dueDate` atual + 7 dias. Exemplo: prevista em 20/10, renovação em 15/10 → nova data 27/10.



\*\*Comportamento atual:\*\* A nova data prevista é a data da operação + 7 dias. No mesmo exemplo, resulta em 22/10, e o usuário perde dias que já tinha.



\*\*Requisito relacionado:\*\* CA27, RN02.



\---



\## Defeito 2: Rejeição por limite de renovações ocorre depois de alterar a data



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, ordem entre `loan.dueDate = ...` e a verificação `loan.renewalCount >= 3`.



\*\*Descrição do problema:\*\* A data prevista é alterada no objeto `loan` antes de verificar o limite de renovações. Quando a quarta renovação é rejeitada, o objeto em memória já foi modificado.



\*\*Comportamento esperado:\*\* Uma renovação rejeitada não altera data nem contador. Todas as validações devem ocorrer antes de qualquer mutação.



\*\*Comportamento atual:\*\* O erro `RENEWAL\_LIMIT\_REACHED` é lançado, mas `loan.dueDate` já foi alterada. Isso persiste o dado incorreto se o repositório devolver a mesma referência de objeto (por exemplo, repositório em memória) ou se qualquer fluxo posterior salvar o objeto. Como a mutação já ocorreu, a garantia de que nada muda em rejeições depende de detalhes do repositório, e não do código.



\*\*Requisito relacionado:\*\* CA32, RN08.



\---



\## Defeito 3: Empréstimo com vencimento no dia da operação é tratado como atrasado



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`.



\*\*Descrição do problema:\*\* A comparação usa `<=`, mas a regra define atraso apenas quando a data prevista é \*\*anterior\*\* à data da operação.



\*\*Comportamento esperado:\*\* Um empréstimo com `dueDate === operationDate` não está atrasado e pode ser renovado. A rejeição só ocorre com `dueDate < operationDate`.



\*\*Comportamento atual:\*\* Renovar no próprio dia do vencimento é rejeitado com `OVERDUE\_LOAN`, embora o empréstimo não esteja atrasado.



\*\*Requisito relacionado:\*\* RN07, CA30.



\---



\## Defeito 4: Renovação incrementa a quantidade disponível do livro de forma incorreta (decrementa)



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, chamada `return this.persistLoan(loan, book);`.



\*\*Descrição do problema:\*\* `persistLoan` foi escrito para a criação de empréstimos: ele executa `book.availableCopies -= 1` e salva o livro. Reutilizá-lo na renovação aplica esse decremento indevido.



\*\*Comportamento esperado:\*\* A renovação apenas atualiza data prevista e contador do empréstimo; a quantidade disponível permanece inalterada.



\*\*Comportamento atual:\*\* Cada renovação reduz em 1 a quantidade disponível do livro, sem nenhum exemplar ter saído. Após três renovações, o estoque disponível fica 3 unidades menor que o real, podendo chegar a valores negativos ou bloquear novos empréstimos.



\*\*Requisito relacionado:\*\* CA29.



\---



\## Resumo



| # | Defeito | Requisito |

|---|---------|-----------|

| 1 | Base do cálculo é a data da operação, não a data prevista | CA27, RN02 |

| 2 | Mutação da data antes de validar o limite | CA32, RN08 |

| 3 | `<=` rejeita renovação no dia do vencimento | RN07, CA30 |

| 4 | `persistLoan` decrementa o estoque na renovação | CA29 |



O limite de três renovações em si (`>= 3`) está correto (CA31, RN03), assim como a validação de empréstimo já devolvido e o incremento do contador (CA28).

