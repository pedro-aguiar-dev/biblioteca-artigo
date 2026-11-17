Aqui estão os defeitos funcionais encontrados no Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`.

\* \*\*Descrição do problema:\*\* A quantidade disponível do livro é decrementada (`book.availableCopies -= 1;`) antes da execução das validações de limites de empréstimo, de empréstimos atrasados e de livro já emprestado, e também antes de entrar no bloco da transação (`this.persistLoan`). Se alguma dessas validações falhar e lançar uma exceção, a transação não reverterá a mutação, pois o erro ocorreu antes do seu início.

\* \*\*Comportamento esperado:\*\* A quantidade disponível do livro não deve ser modificada se a operação for rejeitada por qualquer motivo de validação.

\* \*\*Comportamento atual:\*\* A quantidade disponível do livro é reduzida permanentemente na memória mesmo quando a operação é rejeitada por validações subsequentes.

\* \*\*Requisito relacionado:\*\* CA21 e RN08 (Uma operação rejeitada não pode modificar os dados do sistema / Qualquer rejeição deve preservar a quantidade disponível).



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`.

\* \*\*Descrição do problema:\*\* A verificação do limite de empréstimos chama `this.loanRepository.findByUser(userId)`, que retorna o histórico completo de empréstimos do usuário (incluindo os já devolvidos), em vez de buscar apenas os que estão abertos.

\* \*\*Comportamento esperado:\*\* O sistema deve rejeitar a operação apenas se o usuário possuir 3 empréstimos que ainda estejam \*em aberto\*.

\* \*\*Comportamento atual:\*\* O sistema contabiliza empréstimos passados (já fechados) e impede indevidamente novos empréstimos se o usuário já tiver realizado 3 empréstimos no total da sua vida útil.

\* \*\*Requisito relacionado:\*\* CA19 e RN04 (Cada usuário pode possuir no máximo três empréstimos em aberto).



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`.

\* \*\*Descrição do problema:\*\* A condição que verifica empréstimos atrasados utiliza o operador menor ou igual (`loan.dueDate <= operationDate`). O requisito define que o atraso ocorre quando a data prevista é \*anterior\* (estritamente menor) à data atual.

\* \*\*Comportamento esperado:\*\* Um empréstimo não deve ser considerado atrasado no próprio dia do seu vencimento. A rejeição só deve ocorrer se `dueDate < operationDate`.

\* \*\*Comportamento atual:\*\* O usuário é impedido de realizar novos empréstimos no dia exato do vencimento de um de seus empréstimos.

\* \*\*Requisito relacionado:\*\* RN07 (Um empréstimo está atrasado quando a data prevista é anterior à data da operação).



\*\*Defeito 4\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`.

\* \*\*Descrição do problema:\*\* Para verificar se o usuário já tem o mesmo livro, o código chama `this.loanRepository.findByUserAndBook(userId, bookId)`. Esse método retorna o livro mesmo que o empréstimo anterior já tenha sido devolvido (fechado). O correto seria usar `findOpenByUserAndBook`.

\* \*\*Comportamento esperado:\*\* O usuário não pode realizar a operação apenas se possuir um empréstimo \*em aberto\* daquele mesmo livro.

\* \*\*Comportamento atual:\*\* Se um usuário emprestou um livro no passado e o devolveu com sucesso, o sistema rejeitará permanentemente novos empréstimos do mesmo título para ele.

\* \*\*Requisito relacionado:\*\* CA20 e RN05 (Um usuário não pode manter dois empréstimos abertos para o mesmo livro).



\*\*Defeito 5\*\*



\* \*\*Localização:\*\* `src/loans/loan.service.js`, método `createLoan`.

\* \*\*Descrição do problema:\*\* O cálculo da data de devolução (`dueDate`) é feito utilizando a data atual do sistema físico da máquina através da chamada `new Date()`.

\* \*\*Comportamento esperado:\*\* A data de devolução deve ser calculada acrescentando 14 dias à data fornecida à operação (`currentDate`), permitindo assim o controle e a simulação de tempo nos testes.

\* \*\*Comportamento atual:\*\* O tempo de devolução ignora a variável `currentDate` parametrizada na função e acopla o cálculo ao relógio do sistema/máquina.

\* \*\*Requisito relacionado:\*\* CA15 e RNF01 (Datas e horários devem ser fornecidos por um relógio controlável nos testes, sem depender diretamente do horário da máquina).

