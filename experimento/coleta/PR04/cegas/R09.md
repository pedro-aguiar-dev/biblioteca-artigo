\# Revisão do Pull Request: RF04 (Realizar empréstimo)



Encontrei \*\*6 defeitos funcionais\*\*, todos em `src/loans/loan.service.js`, no método `createLoan`.



\---



\## 1. Quantidade disponível é decrementada antes das validações

\- \*\*Localização:\*\* `createLoan`, linha `book.availableCopies -= 1;`, que vem antes das verificações de limite, atraso e duplicidade.

\- \*\*Descrição:\*\* O decremento é feito no objeto `book` antes de as demais regras serem validadas. A transação (`runInTransaction`) só envolve `persistLoan`, e o snapshot é tirado depois da mutação. Se `findOne` retornar a referência do objeto armazenado (o que é provável em um repositório em memória), o estoque fica reduzido mesmo quando `LOAN\_LIMIT\_REACHED`, `OVERDUE\_LOAN` ou `BOOK\_ALREADY\_BORROWED` são lançados.

\- \*\*Comportamento esperado:\*\* Qualquer rejeição deixa `availableCopies` inalterado. O decremento só deve ocorrer após todas as validações, dentro da transação.

\- \*\*Comportamento atual:\*\* Uma rejeição posterior ao decremento pode reduzir o estoque sem criar empréstimo. Isso se acumula a cada tentativa rejeitada e pode zerar a disponibilidade indevidamente.

\- \*\*Requisitos:\*\* CA21, RN08 (e indiretamente CA16 e RN09).

\- \*\*Ressalva:\*\* O código de `BookRepository.findOne` não está no diff. Se ele retornar uma cópia, o efeito não ocorre, mas a mutação antecipada continua frágil.



\## 2. Limite de três empréstimos conta todos os empréstimos, não só os em aberto

\- \*\*Localização:\*\* `createLoan`, `const loans = await this.loanRepository.findByUser(userId); if (loans.length >= MAX\_OPEN\_LOANS)`.

\- \*\*Descrição:\*\* `findByUser` retorna o histórico completo, incluindo empréstimos já devolvidos.

\- \*\*Comportamento esperado:\*\* Rejeitar apenas quando o usuário tiver três empréstimos \*\*em aberto\*\* (`returnDate === null`).

\- \*\*Comportamento atual:\*\* Um usuário com três ou mais empréstimos já devolvidos é bloqueado indevidamente. Com o tempo, todo usuário fica impedido de pegar livros.

\- \*\*Requisitos:\*\* CA19, RN04.



\## 3. Empréstimo que vence na data da operação é tratado como atrasado

\- \*\*Localização:\*\* `createLoan`, `openLoans.some((loan) => loan.dueDate <= operationDate)`.

\- \*\*Descrição:\*\* A comparação usa `<=`, mas o atraso exige data prevista estritamente anterior à data da operação.

\- \*\*Comportamento esperado:\*\* Atrasado somente se `dueDate < operationDate`. Um empréstimo que vence hoje não bloqueia um novo empréstimo.

\- \*\*Comportamento atual:\*\* Um usuário com empréstimo vencendo no próprio dia da operação é rejeitado com `OVERDUE\_LOAN`.

\- \*\*Requisitos:\*\* CA18, RN06, RN07.



\## 4. Verificação de duplicidade considera empréstimos já devolvidos

\- \*\*Localização:\*\* `createLoan`, `findByUserAndBook(userId, bookId)`.

\- \*\*Descrição:\*\* O método consulta qualquer empréstimo do par usuário/livro, inclusive os com `returnDate` preenchido. O repositório já tem `findOpenByUserAndBook`, que não foi usado.

\- \*\*Comportamento esperado:\*\* Rejeitar apenas se existir empréstimo \*\*aberto\*\* do mesmo livro para o usuário.

\- \*\*Comportamento atual:\*\* Quem já devolveu um livro nunca poderá emprestá-lo novamente (`BOOK\_ALREADY\_BORROWED`).

\- \*\*Requisitos:\*\* CA20, RN05.



\## 5. Data prevista calculada com o relógio da máquina

\- \*\*Localização:\*\* `createLoan`, `dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`.

\- \*\*Descrição:\*\* O prazo é somado à data atual do sistema, não à data da operação informada (`currentDate`). `loanDate` usa `currentDate` e `dueDate` usa `new Date()`, o que gera inconsistência entre os dois campos.

\- \*\*Comportamento esperado:\*\* `dueDate = currentDate + 14 dias`, usando a data fornecida pelo relógio controlável (ex.: `addDays(currentDate, LOAN\_DAYS)`).

\- \*\*Comportamento atual:\*\* A data prevista depende do horário real da máquina. Para `currentDate` diferente de hoje, o prazo fica diferente de 14 dias após o empréstimo, e os testes se tornam não determinísticos.

\- \*\*Requisitos:\*\* CA15, RN01, RNF01.



\## 6. Ordem das validações compromete a preservação do estado (consequência do item 1)

Já coberto no item 1, mas vale registrar a correção conjunta: mover o decremento para dentro de `persistLoan` (ou para depois de todas as validações) resolve CA21/RN08 independentemente de `findOne` devolver referência ou cópia.



\---



\*\*Resumo:\*\* os itens 1 a 5 são defeitos independentes (o 6 é apenas a recomendação de correção do 1). Os principais riscos são a perda de estoque em rejeições (1) e o bloqueio permanente de usuários com histórico de devoluções (2 e 4).

