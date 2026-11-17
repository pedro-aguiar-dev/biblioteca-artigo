\# Revisão do Pull Request: RF04 (Realizar empréstimo)



Encontrei \*\*5 defeitos funcionais\*\*, todos em `src/loans/loan.service.js`.



\---



\### 1. Quantidade disponível é decrementada antes das validações

\- \*\*Localização:\*\* `createLoan`, linha `book.availableCopies -= 1;`, executada antes das checagens de limite, atraso e duplicidade.

\- \*\*Descrição:\*\* O decremento ocorre sobre o objeto retornado por `bookRepository.findOne`, antes de todas as regras de rejeição. Se o repositório devolve a referência armazenada, o estoque é alterado em memória mesmo quando uma regra posterior lança erro. O snapshot de `runInTransaction` só é tirado dentro de `persistLoan`, depois da mutação, e portanto não desfaz nada. Um erro anterior nem chega a passar pela transação.

\- \*\*Comportamento esperado:\*\* Uma operação rejeitada preserva a quantidade disponível. O decremento deve ocorrer só depois de todas as validações, dentro da transação.

\- \*\*Comportamento atual:\*\* Pedidos rejeitados por `LOAN\_LIMIT\_REACHED`, `OVERDUE\_LOAN` ou `BOOK\_ALREADY\_BORROWED` reduzem o estoque do livro permanentemente. Isso pode até levá-lo a 0 sem nenhum empréstimo criado.

\- \*\*Requisitos:\*\* CA21, RN08, RN09, CA16.



\### 2. Limite de empréstimos conta todos os empréstimos, não só os abertos

\- \*\*Localização:\*\* `createLoan`, `const loans = await this.loanRepository.findByUser(userId); if (loans.length >= MAX\_OPEN\_LOANS)`.

\- \*\*Descrição:\*\* `findByUser` retorna o histórico completo, incluindo empréstimos já devolvidos. O correto seria usar `findOpenByUser`.

\- \*\*Comportamento esperado:\*\* Rejeitar apenas quando o usuário já tiver 3 empréstimos em aberto.

\- \*\*Comportamento atual:\*\* Um usuário com 3 empréstimos já devolvidos (e nenhum aberto) é rejeitado com `LOAN\_LIMIT\_REACHED`.

\- \*\*Requisitos:\*\* CA19, RN04.



\### 3. Empréstimo com vencimento no dia da operação é tratado como atrasado

\- \*\*Localização:\*\* `createLoan`, `openLoans.some((loan) => loan.dueDate <= operationDate)`.

\- \*\*Descrição:\*\* O operador `<=` considera atrasado o empréstimo cuja data prevista é igual à data da operação. A regra exige data prevista \*\*anterior\*\* à data da operação.

\- \*\*Comportamento esperado:\*\* Atrasado somente se `dueDate < operationDate`.

\- \*\*Comportamento atual:\*\* No dia do vencimento, o usuário é indevidamente bloqueado com `OVERDUE\_LOAN`.

\- \*\*Requisitos:\*\* CA18, RN06, RN07.



\### 4. Verificação de duplicidade considera empréstimos já devolvidos

\- \*\*Localização:\*\* `createLoan`, `this.loanRepository.findByUserAndBook(userId, bookId)`.

\- \*\*Descrição:\*\* O método usado não filtra por `returnDate === null`. O repositório já oferece `findOpenByUserAndBook`, que não é utilizado.

\- \*\*Comportamento esperado:\*\* Rejeitar apenas se existir empréstimo \*\*aberto\*\* do mesmo livro para o mesmo usuário.

\- \*\*Comportamento atual:\*\* Quem já devolveu um livro não consegue emprestá-lo novamente (`BOOK\_ALREADY\_BORROWED`).

\- \*\*Requisitos:\*\* CA20, RN05.



\### 5. Data prevista calculada a partir do relógio da máquina

\- \*\*Localização:\*\* `createLoan`, `dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`.

\- \*\*Descrição:\*\* A data prevista parte de `new Date()` em vez de `currentDate`, a data da operação informada, que é a usada em `loanDate`.

\- \*\*Comportamento esperado:\*\* `dueDate = currentDate + 14 dias`, ou seja, `addDays(currentDate, LOAN\_DAYS)`.

\- \*\*Comportamento atual:\*\* `dueDate` depende da data real do servidor e fica inconsistente com `loanDate`. Por exemplo, com `currentDate = 2026-01-10`, o vencimento não será `2026-01-24`. Os testes passam a depender do horário da máquina.

\- \*\*Requisitos:\*\* CA15, RN01, RNF01.



\---



\*\*Observação:\*\* O defeito 1 depende de `findOne` devolver a referência armazenada, o que o trecho visível de `book.repository.js` sugere (`return book;`). Mesmo que devolvesse uma cópia, o decremento antecipado continuaria incorreto, porque o snapshot da transação seria tirado depois da mutação.

