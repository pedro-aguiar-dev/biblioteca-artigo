\# Revisão do Pull Request: devolução de empréstimos



Encontrei \*\*5 defeitos funcionais\*\* em `src/loans/loan.service.js`, todos no método `returnLoan`.



\---



\## Defeito 1: Devolução atrasada é rejeitada



\*\*Localização:\*\* `loan.service.js`, `returnLoan` (chamada a `validateLoanIsNotOverdue`) e a função `validateLoanIsNotOverdue`.



\*\*Descrição do problema:\*\* O método valida se o empréstimo está vencido e lança `OVERDUE\_LOAN` (409) quando `dueDate < currentDate`.



\*\*Comportamento esperado:\*\* A devolução deve ser aceita mesmo quando estiver atrasada, com a data de devolução registrada normalmente.



\*\*Comportamento atual:\*\* Qualquer devolução após a data prevista é rejeitada, e o livro nunca pode ser devolvido nesse caso.



\*\*Requisito relacionado:\*\* CA24.



\---



\## Defeito 2: Quantidade disponível é "restaurada" para o total, em vez de incrementar em 1



\*\*Localização:\*\* `loan.service.js`, `returnLoan`: `book.availableCopies = book.totalCopies;`



\*\*Descrição do problema:\*\* Após salvar o empréstimo, o código sobrescreve a quantidade disponível com a quantidade total do livro.



\*\*Comportamento esperado:\*\* A quantidade disponível aumenta em exatamente uma unidade.



\*\*Comportamento atual:\*\* Se houver outros empréstimos em aberto do mesmo livro, a quantidade disponível passa a ser igual ao total, ignorando esses empréstimos. O estoque fica inflado.



\*\*Requisito relacionado:\*\* CA23 e RN09 (disponível nunca superior ao total, no sentido de consistência do estoque).



\---



\## Defeito 3: Incremento em memória antes de validar a devolução duplicada



\*\*Localização:\*\* `loan.service.js`, `returnLoan`: `book.availableCopies += 1;` executado antes da verificação `if (loan.returnDate)`.



\*\*Descrição do problema:\*\* O incremento é aplicado ao objeto do livro antes de verificar se o empréstimo já foi devolvido. Se o repositório devolver a referência do objeto armazenado (como o `findById` do próprio repositório faz com os empréstimos, retornando o objeto original), a alteração já modifica o estado do sistema, mesmo que a operação seja rejeitada logo depois com `LOAN\_ALREADY\_RETURNED`.



\*\*Comportamento esperado:\*\* Uma tentativa duplicada é rejeitada sem alterar nenhum dado, e a quantidade disponível não aumenta.



\*\*Comportamento atual:\*\* Em uma segunda tentativa de devolução, a quantidade disponível pode ser incrementada em memória antes do erro 409, podendo ultrapassar o total e ficar persistida no estado compartilhado.



\*\*Requisito relacionado:\*\* CA25, CA26, RN08 e RN09.



\---



\## Defeito 4: Falta de atomicidade entre a gravação do empréstimo e do livro



\*\*Localização:\*\* `loan.service.js`, `returnLoan`: `loanRepository.save(loan)` seguido de `bookRepository.save(book)`, sem `runInTransaction`.



\*\*Descrição do problema:\*\* O método `persistLoan`, usado na criação do empréstimo, grava empréstimo e livro dentro de `runInTransaction`. A devolução faz duas gravações separadas, sem transação.



\*\*Comportamento esperado:\*\* Se a gravação do livro falhar, a devolução não deve ficar registrada parcialmente, pois uma operação que falha não pode modificar os dados.



\*\*Comportamento atual:\*\* Se `bookRepository.save` falhar, o empréstimo já estará marcado como devolvido enquanto a quantidade disponível não foi atualizada, deixando os dados inconsistentes.



\*\*Requisito relacionado:\*\* RN08 e CA22/CA23.



\---



\## Defeito 5: Data de devolução não é validada contra a data do empréstimo, e `currentDate` vem do cliente



\*\*Localização:\*\* `loan.routes.js` (`currentDate: req.body?.currentDate`) e `returnLoan` (`loan.returnDate = formatDate(currentDate)`).



\*\*Descrição do problema:\*\* A data de devolução é aceita livremente do corpo da requisição, e não há verificação de que seja igual ou posterior à data do empréstimo.



\*\*Comportamento esperado:\*\* A data registrada deve ser válida e coerente com o empréstimo.



\*\*Comportamento atual:\*\* É possível registrar uma devolução com data anterior à data do empréstimo.



\*\*Requisito relacionado:\*\* CA22. \*(Este é o item de menor confiança: o requisito não define explicitamente a regra, então trate-o como ponto a confirmar com a especificação.)\*



\---



\## Resumo



| # | Defeito | Gravidade | Requisito |

|---|---------|-----------|-----------|

| 1 | Rejeita devolução atrasada | Alta | CA24 |

| 2 | Disponível = total em vez de +1 | Alta | CA23, RN09 |

| 3 | Incremento antes da validação de duplicidade | Alta | CA25, CA26, RN08 |

| 4 | Gravações sem transação | Média | RN08 |

| 5 | Data de devolução sem validação de coerência | Baixa (a confirmar) | CA22 |



\*\*Observação sobre a forma de correção dos itens 2 e 3:\*\* mover o incremento para depois da validação de duplicidade e usar `book.availableCopies += 1` (limitado ao total) dentro de `runInTransaction(\[loanRepository, bookRepository], ...)`, no mesmo padrão de `persistLoan`, resolve os defeitos 2, 3 e 4 de uma vez.

