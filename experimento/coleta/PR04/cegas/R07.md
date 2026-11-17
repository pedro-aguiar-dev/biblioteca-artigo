Aqui estão os defeitos funcionais identificados no Pull Request, com base nos requisitos e regras de negócio fornecidos:



\### Defeito 1



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`, linha 44-45 (`const loans = await this.loanRepository.findByUser(userId);`).

\* \*\*Descrição do problema:\*\* O sistema está contabilizando o histórico total de empréstimos do usuário (incluindo os já devolvidos) em vez de considerar apenas os empréstimos em aberto.

\* \*\*Comportamento esperado:\*\* A operação só deve ser rejeitada se o usuário possuir três empréstimos \*em aberto\*.

\* \*\*Comportamento atual:\*\* A operação é rejeitada se o usuário já tiver realizado três empréstimos ao longo da vida, mesmo que já tenham sido devolvidos.

\* \*\*Requisito relacionado:\*\* CA19 / RN04.



\### Defeito 2



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`, linha 51 (`if (openLoans.some((loan) => loan.dueDate <= operationDate))`).

\* \*\*Descrição do problema:\*\* A regra de verificação de empréstimo atrasado está incorreta ao incluir a própria data da operação como atraso.

\* \*\*Comportamento esperado:\*\* Um empréstimo só é considerado atrasado quando a data prevista é estritamente \*anterior\* (`<`) à data da operação.

\* \*\*Comportamento atual:\*\* O sistema considera como atrasado um empréstimo cuja data de devolução seja igual à data da operação (usando `<=`), impedindo o empréstimo injustamente.

\* \*\*Requisito relacionado:\*\* RN07.



\### Defeito 3



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`, linhas 55-58 (`const duplicatedBook = await this.loanRepository.findByUserAndBook(...)`).

\* \*\*Descrição do problema:\*\* O sistema impede o empréstimo se o usuário já tiver pego este livro emprestado em qualquer momento do passado.

\* \*\*Comportamento esperado:\*\* O sistema deve rejeitar o empréstimo apenas se o usuário possuir o mesmo livro emprestado \*no momento\* (empréstimo aberto). Deveria ser utilizado o método `findOpenByUserAndBook`.

\* \*\*Comportamento atual:\*\* O método `findByUserAndBook` busca todo o histórico e rejeita a operação mesmo que o empréstimo anterior do mesmo livro já tenha sido devolvido.

\* \*\*Requisito relacionado:\*\* CA20 / RN05.



\### Defeito 4



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`, linha 67 (`dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`).

\* \*\*Descrição do problema:\*\* O cálculo da data prevista para devolução está utilizando o relógio da máquina (`new Date()`) em vez da data controlável fornecida no payload da requisição.

\* \*\*Comportamento esperado:\*\* A data de devolução deve ser calculada somando-se 14 dias à data da operação (`currentDate`).

\* \*\*Comportamento atual:\*\* A data de devolução ignora a data da operação informada, violando o requisito não-funcional de controlabilidade via relógio/testes.

\* \*\*Requisito relacionado:\*\* CA15 / RNF01.



\### Defeito 5



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`, linha 42 (`book.availableCopies -= 1;`).

\* \*\*Descrição do problema:\*\* A subtração da quantidade de exemplares é feita antes de validar todas as regras de negócio (limite de empréstimos, atrasos e livro repetido) e fora do bloco da transação (`runInTransaction`).

\* \*\*Comportamento esperado:\*\* Se a operação for rejeitada por qualquer motivo, os dados do sistema não podem ser modificados, devendo preservar a quantidade disponível inicial.

\* \*\*Comportamento atual:\*\* A quantidade disponível do livro é decrementada na memória. Se o fluxo disparar um `AppError` nas linhas 46, 52 ou 60, esse decremento não sofre rollback, pois o erro ocorre antes do início da transação, gerando perda irrecuperável de quantidade disponível na instância do livro em memória.

\* \*\*Requisito relacionado:\*\* CA21 / RN08.

