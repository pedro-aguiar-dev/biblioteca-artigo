\# Revisão do Pull Request: RF04 (Realizar empréstimo)



Encontrei \*\*6 defeitos funcionais\*\*, todos em `src/loans/loan.service.js`, no método `createLoan`.



\---



\## 1. Decremento do estoque antes das validações



\- \*\*Localização:\*\* `loan.service.js`, `createLoan`, linha `book.availableCopies -= 1;`. Ela vem antes das verificações de limite, atraso e duplicidade, e fora de `runInTransaction`.

\- \*\*Descrição:\*\* a quantidade disponível é alterada no objeto `book` antes de as demais regras serem avaliadas. Se `findOne` devolver a referência do objeto armazenado no repositório (comum em repositórios em memória), a alteração persiste mesmo quando uma regra seguinte lança erro. A transação só envolve `persistLoan`, e o snapshot é tirado depois da mutação, então ele não consegue desfazê-la.

\- \*\*Comportamento esperado:\*\* qualquer rejeição deixa `availableCopies` intacto. O decremento só deve ocorrer após todas as validações, dentro da transação.

\- \*\*Comportamento atual:\*\* rejeições por `LOAN\_LIMIT\_REACHED`, `OVERDUE\_LOAN` ou `BOOK\_ALREADY\_BORROWED` podem deixar o estoque reduzido em 1 sem empréstimo criado.

\- \*\*Requisitos:\*\* CA16, CA21, RN08, RN09.



\*Não vi a implementação de `BookRepository.findOne`. Se ele retornar uma cópia, o defeito não se manifesta hoje, mas continua frágil.\*



\## 2. Limite de três empréstimos conta o histórico, não os abertos



\- \*\*Localização:\*\* `loan.service.js`, `this.loanRepository.findByUser(userId)` seguido de `loans.length >= MAX\_OPEN\_LOANS`.

\- \*\*Descrição:\*\* `findByUser` retorna todos os empréstimos do usuário, inclusive os já devolvidos. O correto seria usar `findOpenByUser`.

\- \*\*Comportamento esperado:\*\* rejeitar apenas quando o usuário já tiver 3 empréstimos \*\*em aberto\*\* (`returnDate === null`).

\- \*\*Comportamento atual:\*\* um usuário com 3 ou mais empréstimos já devolvidos é bloqueado indevidamente.

\- \*\*Requisitos:\*\* CA19, RN04.



\## 3. Comparação de atraso incorreta (`<=` em vez de `<`)



\- \*\*Localização:\*\* `loan.service.js`, `openLoans.some((loan) => loan.dueDate <= operationDate)`.

\- \*\*Descrição:\*\* a regra define atraso como data prevista \*\*anterior\*\* à data da operação, mas o código também considera atrasado o empréstimo que vence no próprio dia.

\- \*\*Comportamento esperado:\*\* atrasado somente se `dueDate < operationDate`.

\- \*\*Comportamento atual:\*\* um usuário com empréstimo vencendo hoje é rejeitado com `OVERDUE\_LOAN`, apesar de não estar atrasado.

\- \*\*Requisitos:\*\* CA18, RN06, RN07.



\## 4. Verificação de duplicidade considera empréstimos já devolvidos



\- \*\*Localização:\*\* `loan.service.js`, `this.loanRepository.findByUserAndBook(userId, bookId)`.

\- \*\*Descrição:\*\* o método usado não filtra por `returnDate === null`. O repositório já oferece `findOpenByUserAndBook`, que não é utilizado.

\- \*\*Comportamento esperado:\*\* rejeitar somente se o usuário tiver um empréstimo \*\*aberto\*\* do mesmo livro.

\- \*\*Comportamento atual:\*\* quem já devolveu um livro não consegue emprestá-lo de novo (`BOOK\_ALREADY\_BORROWED`).

\- \*\*Requisitos:\*\* CA20, RN05.



\## 5. Data prevista calculada com o relógio do sistema



\- \*\*Localização:\*\* `loan.service.js`, `dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`.

\- \*\*Descrição:\*\* a data prevista parte de `new Date()` (horário da máquina), e não da data da operação (`currentDate`) recebida na requisição, usada em `loanDate`.

\- \*\*Comportamento esperado:\*\* `dueDate = currentDate + 14 dias`, ou seja, `addDays(currentDate, LOAN\_DAYS)`.

\- \*\*Comportamento atual:\*\* `loanDate` e `dueDate` ficam inconsistentes, a menos que `currentDate` coincida com o dia real. Os testes com data controlada falham ou ficam não determinísticos.

\- \*\*Requisitos:\*\* CA15, RN01, RNF01.



\---



\## Resumo



| # | Defeito | Requisitos |

|---|---------|-----------|

| 1 | Decremento do estoque antes das validações (rejeição pode alterar dados) | CA16, CA21, RN08, RN09 |

| 2 | Limite conta histórico em vez de empréstimos abertos | CA19, RN04 |

| 3 | `<=` no lugar de `<` na regra de atraso | CA18, RN06, RN07 |

| 4 | Duplicidade ignora o status de devolução | CA20, RN05 |

| 5 | `dueDate` usa `new Date()` em vez de `currentDate` | CA15, RN01, RNF01 |



Os itens 2 a 5 têm correção direta, trocando o método ou a expressão indicada. No item 1, a correção é mover o decremento para dentro do callback de `runInTransaction`, depois das validações e antes do `save` do livro. Contando os itens 1 a 5 acima, são 5 defeitos distintos; descartei um sexto que havia considerado (não há problema adicional no restante do diff).



\*\*Correção do total:\*\* são \*\*5 defeitos\*\*, não 6 como escrevi no início.

