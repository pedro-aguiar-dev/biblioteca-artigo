Aqui estão os defeitos funcionais identificados no Pull Request, com base nos requisitos e regras de negócio fornecidos:



\### Defeito 1: Rejeição de devoluções em atraso



\* \*\*Localização:\*\* `src/loans/loan.service.js` (chamada para `validateLoanIsNotOverdue` dentro de `returnLoan` e a própria implementação da função `validateLoanIsNotOverdue`).

\* \*\*Descrição do problema:\*\* O sistema possui uma validação que verifica se o empréstimo está atrasado (`loan.dueDate < currentDate`) e interrompe a operação lançando a exceção `"OVERDUE\_LOAN"`.

\* \*\*Comportamento esperado:\*\* A devolução do livro deve ocorrer normalmente e ser registrada com sucesso, independentemente de a data atual ser posterior à data prevista de devolução.

\* \*\*Comportamento atual:\*\* O sistema lança um erro 409 e aborta a devolução caso o empréstimo esteja atrasado.

\* \*\*Requisito relacionado:\*\* CA24 A devolução deve ser aceita mesmo quando estiver atrasada.



\### Defeito 2: Sobrescrita incorreta da quantidade de livros disponíveis



\* \*\*Localização:\*\* `src/loans/loan.service.js` (no método `returnLoan`, linha `book.availableCopies = book.totalCopies;`).

\* \*\*Descrição do problema:\*\* Em vez de incrementar a quantidade de exemplares disponíveis, o código iguala as cópias disponíveis ao total de cópias do livro logo antes de salvar no repositório. Isso ignora o fato de que podem existir outras cópias deste mesmo livro emprestadas para outros usuários.

\* \*\*Comportamento esperado:\*\* A quantidade disponível de livros deve ser aumentada em exatamente 1 unidade após a devolução.

\* \*\*Comportamento atual:\*\* A quantidade disponível é sobrescrita pela quantidade total, podendo gerar um número irreal de cópias disponíveis caso haja mais empréstimos em aberto.

\* \*\*Requisito relacionado:\*\* CA23 A quantidade disponível do livro deve aumentar em uma unidade.



\### Defeito 3: Modificação de estado antes da validação de operação duplicada



\* \*\*Localização:\*\* `src/loans/loan.service.js` (no método `returnLoan`, linha `book.availableCopies += 1;` ocorrendo antes da validação `if (loan.returnDate)`).

\* \*\*Descrição do problema:\*\* O código incrementa o valor de `book.availableCopies` na entidade em memória \*antes\* de validar se o empréstimo já havia sido devolvido. Considerando o padrão de repositório em memória evidenciado pelo diff em `loan.repository.js`, alterar a propriedade do objeto diretamente modifica a referência na memória do sistema. Quando o código lança o erro `"LOAN\_ALREADY\_RETURNED"`, a operação é rejeitada, mas o objeto no sistema já foi mutado.

\* \*\*Comportamento esperado:\*\* As validações das regras de negócio (como checar se o empréstimo já foi devolvido) devem ocorrer antes de qualquer manipulação no estado dos dados das entidades.

\* \*\*Comportamento atual:\*\* A quantidade de livros disponíveis é incrementada e o objeto é alterado antes da rejeição da tentativa duplicada.

\* \*\*Requisito relacionado:\*\* RN08 Uma operação rejeitada não pode modificar os dados do sistema / CA26 Uma tentativa duplicada não pode aumentar novamente a quantidade disponível.

