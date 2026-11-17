\# Revisão do Pull Request: devolução de empréstimos



Encontrei \*\*4 defeitos funcionais\*\* em `src/loans/loan.service.js` (método `returnLoan`).



\---



\## Defeito 1: Devolução atrasada é rejeitada



\*\*Localização:\*\* `loan.service.js`, `returnLoan` (chamada a `validateLoanIsNotOverdue`) e a função `validateLoanIsNotOverdue`.



\*\*Descrição do problema:\*\* O método lança `OVERDUE\_LOAN` (409) quando `loan.dueDate < currentDate`, bloqueando a devolução de empréstimos vencidos.



\*\*Comportamento esperado:\*\* A devolução deve ser aceita mesmo atrasada: a data é registrada e a quantidade disponível aumenta.



\*\*Comportamento atual:\*\* Devoluções atrasadas são rejeitadas com 409 e não são registradas. O livro permanece indisponível e o empréstimo continua em aberto indefinidamente.



\*\*Requisito relacionado:\*\* CA24 (e, por consequência, CA22 e CA23 para empréstimos atrasados).



\---



\## Defeito 2: Quantidade disponível é redefinida para o total, em vez de incrementar em 1



\*\*Localização:\*\* `loan.service.js`, `returnLoan`, linha `book.availableCopies = book.totalCopies;` antes de `bookRepository.save(book)`.



\*\*Descrição do problema:\*\* Após salvar o empréstimo, o código sobrescreve a quantidade disponível com a quantidade total, descartando o incremento anterior.



\*\*Comportamento esperado:\*\* A quantidade disponível aumenta exatamente em uma unidade.



\*\*Comportamento atual:\*\* Se um livro tem 5 exemplares e 3 estão emprestados (2 disponíveis), uma devolução faz a disponibilidade saltar para 5 em vez de 3. Isso corrompe o estoque, pois os demais empréstimos em aberto passam a não ser refletidos.



\*\*Requisito relacionado:\*\* CA23 e RN09 (a disponibilidade deixa de refletir a realidade, embora não ultrapasse o total).



\---



\## Defeito 3: Mutação do livro antes da validação de devolução duplicada



\*\*Localização:\*\* `loan.service.js`, `returnLoan`: `book.availableCopies += 1;` está antes de `if (loan.returnDate) throw ...`.



\*\*Descrição do problema:\*\* O incremento é feito no objeto `book` antes de verificar se o empréstimo já foi devolvido. Quando o repositório devolve a referência do objeto armazenado (como o `findById`, que retorna o próprio elemento do array, sugere), a mutação altera o estado em memória mesmo que a requisição seja rejeitada em seguida.



\*\*Comportamento esperado:\*\* Uma tentativa duplicada é rejeitada sem alterar nenhum dado; a disponibilidade não aumenta novamente.



\*\*Comportamento atual:\*\* Em uma segunda tentativa de devolução, `availableCopies` é incrementado no objeto antes do erro 409. Dependendo de como o repositório lida com referências, a alteração persiste e pode ultrapassar `totalCopies`. O mesmo ocorre no caso de rejeição por atraso (Defeito 1), pois o incremento já ocorreu.



\*\*Requisito relacionado:\*\* CA26, RN08 e RN09.



\---



\## Defeito 4: Operação não atômica entre empréstimo e livro



\*\*Localização:\*\* `loan.service.js`, `returnLoan`: `loanRepository.save(loan)` seguido de `bookRepository.save(book)`, sem `runInTransaction`.



\*\*Descrição do problema:\*\* O fluxo de criação usa `persistLoan`, que envolve ambos os repositórios em `runInTransaction`. A devolução salva os dois separadamente. Se a gravação do livro falhar, o empréstimo fica marcado como devolvido sem que a disponibilidade tenha sido atualizada.



\*\*Comportamento esperado:\*\* A devolução é aplicada por inteiro ou não é aplicada, e uma operação que falha não modifica os dados.



\*\*Comportamento atual:\*\* Falha parcial deixa os dados inconsistentes: empréstimo devolvido, estoque não atualizado, e uma nova tentativa é bloqueada por `LOAN\_ALREADY\_RETURNED`.



\*\*Requisito relacionado:\*\* RN08, CA22 e CA23.



\---



\### Observação

Não considerei como defeito o uso de `currentDate` vindo do corpo da requisição, pois o enunciado não define a origem da data.

