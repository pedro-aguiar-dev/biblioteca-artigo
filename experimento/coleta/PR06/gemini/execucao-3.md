Com base na análise do Pull Request e nos requisitos fornecidos, identifiquei \*\*3 defeitos funcionais\*\* introduzidos no código:



\### Defeito 1: Validação incorreta de empréstimo atrasado



\* \*\*localização\*\*: `src/loans/loan.service.js`, no método `renewLoan`, na linha `if (loan.dueDate <= operationDate)`.

\* \*\*descrição do problema\*\*: A verificação utiliza o operador menor ou igual (`<=`), o que considera o empréstimo como atrasado mesmo se a renovação for feita no dia exato da data prevista.

\* \*\*comportamento esperado\*\*: O empréstimo só deve ser considerado atrasado se a data prevista for estritamente \*anterior\* à data da operação (operador `<`), permitindo a renovação no dia exato do vencimento.

\* \*\*comportamento atual\*\*: O sistema bloqueia a renovação e lança o erro "OVERDUE\_LOAN" caso a operação ocorra na mesma data do vencimento.

\* \*\*requisito relacionado\*\*: CA30 e RN07.



\### Defeito 2: Cálculo incorreto da nova data prevista



\* \*\*localização\*\*: `src/loans/loan.service.js`, no método `renewLoan`, na linha `loan.dueDate = formatDate(addDays(currentDate, 7));`.

\* \*\*descrição do problema\*\*: A adição dos 7 dias está utilizando a data da operação (`currentDate`) como base em vez da data prevista que já existia no empréstimo.

\* \*\*comportamento esperado\*\*: Os 7 dias adicionais devem ser somados à data prevista atual do empréstimo (`loan.dueDate`).

\* \*\*comportamento atual\*\*: Os 7 dias estão sendo somados à data de solicitação da renovação, fazendo com que o usuário perca dias de prazo caso renove o livro antes da data de vencimento.

\* \*\*requisito relacionado\*\*: CA27 e RN02.



\### Defeito 3: Alteração da quantidade de livros disponíveis



\* \*\*localização\*\*: `src/loans/loan.service.js`, no final do método `renewLoan`, na linha `return this.persistLoan(loan, book);`.

\* \*\*descrição do problema\*\*: O método reaproveita a função auxiliar `persistLoan` para salvar a renovação. No entanto, a implementação de `persistLoan` possui a instrução fixa `book.availableCopies -= 1;`, que serve para o momento de \*criação\* de um empréstimo.

\* \*\*comportamento esperado\*\*: A renovação de um empréstimo deve atualizar apenas os dados do empréstimo em si, sem impactar a disponibilidade do livro no acervo.

\* \*\*comportamento atual\*\*: Cada renovação de empréstimo reduz em 1 unidade a quantidade disponível de cópias daquele livro no sistema.

\* \*\*requisito relacionado\*\*: CA29.

