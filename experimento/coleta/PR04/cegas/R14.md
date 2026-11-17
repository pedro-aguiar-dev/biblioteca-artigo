\# Revisão do Pull Request (RF04: Realizar empréstimo)



Encontrei \*\*5 defeitos funcionais\*\*, todos em `src/loans/loan.service.js`, no método `createLoan`.



\---



\### 1. Decremento do estoque antes das validações (rejeições alteram os dados)

\- \*\*Localização:\*\* `createLoan`, linha `book.availableCopies -= 1;`, que vem antes das verificações de limite, atraso e duplicidade.

\- \*\*Descrição:\*\* O estoque é decrementado no objeto `book` antes de as demais regras serem validadas. Se `findOne` devolver a referência do objeto guardado no repositório (típico de um repositório em memória), a alteração persiste mesmo quando uma das validações seguintes lança erro. A transação em `persistLoan` não ajuda: o snapshot é tirado depois da mutação, então o rollback restaura o estado já alterado.

\- \*\*Comportamento esperado:\*\* Toda rejeição preserva `availableCopies`. O decremento só deve ocorrer depois de todas as validações, junto com a gravação do empréstimo.

\- \*\*Comportamento atual:\*\* Uma rejeição por `LOAN\_LIMIT\_REACHED`, `OVERDUE\_LOAN` ou `BOOK\_ALREADY\_BORROWED` pode deixar o livro com uma unidade a menos, e isso pode levar o estoque a zero indevidamente.

\- \*\*Requisitos:\*\* CA21, RN08, RN09.



\### 2. Limite de empréstimos conta todos os empréstimos, não só os em aberto

\- \*\*Localização:\*\* `createLoan`, `const loans = await this.loanRepository.findByUser(userId); if (loans.length >= MAX\_OPEN\_LOANS)`.

\- \*\*Descrição:\*\* `findByUser` retorna o histórico completo, incluindo empréstimos já devolvidos. O correto seria usar `findOpenByUser`.

\- \*\*Comportamento esperado:\*\* Rejeitar apenas quando o usuário já tiver 3 empréstimos em aberto.

\- \*\*Comportamento atual:\*\* Um usuário com 3 empréstimos já devolvidos (e nenhum em aberto) é rejeitado com `LOAN\_LIMIT\_REACHED`.

\- \*\*Requisitos:\*\* CA19, RN04.



\### 3. Empréstimo vencido no próprio dia é tratado como atrasado

\- \*\*Localização:\*\* `createLoan`, `openLoans.some((loan) => loan.dueDate <= operationDate)`.

\- \*\*Descrição:\*\* O operador `<=` considera atrasado um empréstimo cuja data prevista é igual à data da operação.

\- \*\*Comportamento esperado:\*\* Atrasado somente quando `dueDate < operationDate`.

\- \*\*Comportamento atual:\*\* No dia do vencimento, o usuário já é bloqueado com `OVERDUE\_LOAN`.

\- \*\*Requisitos:\*\* CA18, RN06, RN07.



\### 4. Verificação de duplicidade considera empréstimos já devolvidos

\- \*\*Localização:\*\* `createLoan`, `this.loanRepository.findByUserAndBook(userId, bookId)`.

\- \*\*Descrição:\*\* O método usado ignora `returnDate`. O repositório já oferece `findOpenByUserAndBook`, que não foi usado.

\- \*\*Comportamento esperado:\*\* Rejeitar apenas se existir empréstimo \*\*aberto\*\* do mesmo livro para o usuário.

\- \*\*Comportamento atual:\*\* Quem já devolveu um livro não consegue pegá-lo emprestado novamente (`BOOK\_ALREADY\_BORROWED`).

\- \*\*Requisitos:\*\* CA20, RN05.



\### 5. Data prevista calculada com o relógio da máquina

\- \*\*Localização:\*\* `createLoan`, `dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`.

\- \*\*Descrição:\*\* A data prevista parte de `new Date()` em vez da data da operação (`currentDate`), que é usada em `loanDate`.

\- \*\*Comportamento esperado:\*\* `dueDate = currentDate + 14 dias`, ou seja, `addDays(currentDate, LOAN\_DAYS)`.

\- \*\*Comportamento atual:\*\* `dueDate` depende do horário real da máquina e fica inconsistente com `loanDate`. Por exemplo, com `currentDate = 2026-01-10`, a data prevista não será `2026-01-24`. Isso também torna os testes não determinísticos.

\- \*\*Requisitos:\*\* CA15, RN01, RNF01.



\---



\*\*Observação (não confirmada pelo diff):\*\* `persistLoan` chama `bookRepository.save(book)` e `createLoan` chama `userRepository.findById`. Esses métodos não aparecem nas alterações, então não consegui verificar que existem. Vale confirmar no código-base, porque a ausência de qualquer um deles quebraria o fluxo.

