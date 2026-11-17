\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*4 defeitos funcionais\*\* em `renewLoan` (`src/loans/loan.service.js`).



\---



\## Defeito 1: Cálculo errado da nova data prevista



\- \*\*Localização:\*\* `loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`

\- \*\*Descrição do problema:\*\* Os 7 dias são somados à data da operação (`currentDate`), e não à data prevista atual do empréstimo (`loan.dueDate`).

\- \*\*Comportamento esperado:\*\* A nova data prevista é a data prevista atual + 7 dias. Por exemplo, com previsão em 20/10 e renovação em 15/10, o resultado deve ser 27/10.

\- \*\*Comportamento atual:\*\* O resultado é a data da operação + 7 dias (22/10 no exemplo). Quem renova com antecedência perde dias de prazo, e a data fica incorreta.

\- \*\*Requisito relacionado:\*\* CA27, RN02.



\---



\## Defeito 2: Empréstimo com vencimento no dia da operação é tratado como atrasado



\- \*\*Localização:\*\* `loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`.

\- \*\*Descrição do problema:\*\* A comparação usa `<=`, mas a regra define atraso apenas quando a data prevista é \*\*anterior\*\* à data da operação.

\- \*\*Comportamento esperado:\*\* Um empréstimo cuja data prevista é igual à data da operação \*\*não\*\* está atrasado e pode ser renovado (`loan.dueDate < operationDate` rejeita).

\- \*\*Comportamento atual:\*\* No dia do vencimento, a renovação é rejeitada com `OVERDUE\_LOAN`, embora o empréstimo ainda não esteja atrasado.

\- \*\*Requisito relacionado:\*\* RN07, CA30.



\---



\## Defeito 3: Rejeição por limite de renovações ocorre depois de alterar a data



\- \*\*Localização:\*\* `loan.service.js`, `renewLoan`, ordem entre `loan.dueDate = ...` e `if (loan.renewalCount >= 3) throw ...`.

\- \*\*Descrição do problema:\*\* `loan.dueDate` é modificado no objeto antes da validação do limite de renovações. Quando a quarta renovação é rejeitada, o objeto `loan` já foi alterado em memória.

\- \*\*Comportamento esperado:\*\* Todas as validações devem ocorrer antes de qualquer alteração. Uma renovação rejeitada não modifica a data nem o contador.

\- \*\*Comportamento atual:\*\* A exceção é lançada com `dueDate` já alterado. Se o repositório devolver a mesma referência de objeto em memória (comum em implementações em memória), a data fica modificada mesmo com a renovação rejeitada. Mesmo que não persista, a mutação antes da validação é frágil e viola a regra.

\- \*\*Requisito relacionado:\*\* CA32, RN08, CA31, RN03.



\---



\## Defeito 4: Renovação decrementa a quantidade disponível do livro



\- \*\*Localização:\*\* `loan.service.js`, `renewLoan`, chamada `return this.persistLoan(loan, book);`.

\- \*\*Descrição do problema:\*\* `persistLoan` foi escrito para a criação de empréstimo e executa `book.availableCopies -= 1`. Reutilizá-lo na renovação reduz o estoque a cada renovação.

\- \*\*Comportamento esperado:\*\* A quantidade disponível permanece inalterada na renovação. Só o empréstimo (data e contador) deve ser salvo.

\- \*\*Comportamento atual:\*\* Cada renovação bem-sucedida diminui `availableCopies` em 1, o que pode até levar o valor a ficar negativo e deixa o livro indisponível indevidamente.

\- \*\*Requisito relacionado:\*\* CA29.



\---



\## Resumo



| # | Defeito | Requisitos |

|---|---------|-----------|

| 1 | Soma 7 dias à data da operação em vez da data prevista | CA27, RN02 |

| 2 | `<=` trata vencimento no mesmo dia como atraso | RN07, CA30 |

| 3 | Data alterada antes da validação do limite | CA31, CA32, RN03, RN08 |

| 4 | `persistLoan` decrementa o estoque na renovação | CA29 |



Os demais pontos estão corretos: a verificação de limite (`>= 3` rejeita a quarta renovação), o incremento do contador em 1 e a rota `POST /:id/renew`.

