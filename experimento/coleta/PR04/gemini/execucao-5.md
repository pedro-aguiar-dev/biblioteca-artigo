Aqui estão os defeitos funcionais identificados no Pull Request, com base nos requisitos e regras de negócio:



\### 1. Alteração de estado em caso de rejeição da operação (Side Effect)



\* \*\*Localização:\*\* `src/loans/loan.service.js` no método `createLoan` (linha `book.availableCopies -= 1;`).

\* \*\*Descrição do problema:\*\* A quantidade de exemplares do livro é decrementada na memória antes da execução das demais validações de negócio (limite de empréstimos, atrasos e livro duplicado). Como a operação de rollback (transação) só é chamada no final em `persistLoan`, se qualquer validação subsequente falhar, a redução do estoque persistirá indevidamente no objeto em memória.

\* \*\*Comportamento esperado:\*\* A quantidade disponível só deve ser efetivamente reduzida se a operação for concluída com sucesso. Nenhuma rejeição deve modificar os dados do sistema.

\* \*\*Comportamento atual:\*\* Se um usuário for bloqueado por ter limite de empréstimos excedido, empréstimos atrasados ou livro duplicado, o sistema ainda assim terá diminuído o saldo do livro em 1 unidade.

\* \*\*Requisito relacionado:\*\* CA21 e RN08.



\### 2. Validação do limite de empréstimos considerando o histórico total



\* \*\*Localização:\*\* `src/loans/loan.service.js` no método `createLoan` (uso de `this.loanRepository.findByUser(userId)` para o tamanho da lista).

\* \*\*Descrição do problema:\*\* Para verificar o limite de empréstimos por usuário, o código busca o histórico completo de empréstimos do usuário (`findByUser`), contabilizando inclusive os já devolvidos.

\* \*\*Comportamento esperado:\*\* A restrição de limite máximo de três empréstimos deve considerar apenas os empréstimos que ainda estão em aberto.

\* \*\*Comportamento atual:\*\* O sistema impede novos empréstimos para usuários que realizaram 3 empréstimos ao longo da vida, mesmo que todos já tenham sido devolvidos.

\* \*\*Requisito relacionado:\*\* CA19 e RN04.



\### 3. Regra de atraso incorreta (incluindo o dia do vencimento)



\* \*\*Localização:\*\* `src/loans/loan.service.js` no método `createLoan` (condição `loan.dueDate <= operationDate`).

\* \*\*Descrição do problema:\*\* A lógica que determina se um usuário tem um empréstimo atrasado está usando o operador menor ou igual (`<=`).

\* \*\*Comportamento esperado:\*\* Um empréstimo só deve ser considerado atrasado se a data prevista (`dueDate`) for estritamente \*anterior\* (`<`) à data da operação.

\* \*\*Comportamento atual:\*\* O usuário fica impedido de realizar novos empréstimos se possuir um livro cuja data de devolução seja o exato dia da operação (vencendo hoje).

\* \*\*Requisito relacionado:\*\* RN07.



\### 4. Validação de livro duplicado considerando o histórico total



\* \*\*Localização:\*\* `src/loans/loan.service.js` no método `createLoan` (uso de `this.loanRepository.findByUserAndBook(userId, bookId)`).

\* \*\*Descrição do problema:\*\* A verificação se o usuário já possui o livro utiliza um método que busca em todo o histórico, não considerando o status da devolução. Embora o repositório forneça o método correto (`findOpenByUserAndBook`), ele não foi utilizado.

\* \*\*Comportamento esperado:\*\* A operação deve ser rejeitada apenas se o usuário tiver um empréstimo \*em aberto\* para o mesmo livro.

\* \*\*Comportamento atual:\*\* Se um usuário pegou um livro emprestado e o devolveu corretamente no passado, ele será impedido de pegar o mesmo livro novamente.

\* \*\*Requisito relacionado:\*\* CA20 e RN05.



\### 5. Dependência do relógio do sistema para o cálculo da data prevista



\* \*\*Localização:\*\* `src/loans/loan.service.js` no método `createLoan` (criação do objeto loan, propriedade `dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`).

\* \*\*Descrição do problema:\*\* O cálculo da data prevista de devolução (`dueDate`) está sendo realizado utilizando o horário direto do sistema `new Date()`, em vez da data da operação (`currentDate`) fornecida no escopo da transação.

\* \*\*Comportamento esperado:\*\* O cálculo da devolução (acréscimo de 14 dias) deve ser feito em cima da data da operação injetada (`currentDate`), permitindo o total controle do tempo nos testes.

\* \*\*Comportamento atual:\*\* A data calculada força o uso da data do servidor (`new Date()`), o que gera inconsistência com `loanDate: operationDate` e quebra a controlabilidade do tempo para os testes.

\* \*\*Requisito relacionado:\*\* CA15 e RNF01.

