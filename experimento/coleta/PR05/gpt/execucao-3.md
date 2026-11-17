\## Revisão do Pull Request — RF05: Realizar devolução



Foram identificados 4 defeitos funcionais nas alterações do Pull Request.



\### Defeito 1 — Devolução de empréstimos atrasados é rejeitada



Localização: `src/loans/loan.service.js`, método `returnLoan`, chamada de `validateLoanIsNotOverdue` e função auxiliar.



Trecho:



```

validateLoanIsNotOverdue(loan, formatDate(currentDate));

```



```

function validateLoanIsNotOverdue(loan, currentDate) {

&#x20; if (loan.dueDate < currentDate) {

&#x20;   throw new AppError("OVERDUE\_LOAN", 409);

&#x20; }

}

```



Descrição do problema: A implementação impede a devolução de empréstimos cuja data prevista seja anterior à data atual.



Comportamento esperado: Empréstimos atrasados devem poder ser devolvidos normalmente, com registro da data de devolução e incremento da quantidade disponível.



Comportamento atual: A operação retorna erro `OVERDUE\_LOAN` (HTTP 409), impedindo a devolução. Além disso, como `book.availableCopies` já foi incrementado, a operação rejeitada pode alterar o estoque em memória.



Requisito relacionado: CA24 e RN08.



\### Defeito 2 — Tentativa duplicada altera a quantidade disponível



Localização: `src/loans/loan.service.js`, método `returnLoan`.



Trecho:



```

book.availableCopies += 1;



if (loan.returnDate) {

&#x20; throw new AppError("LOAN\_ALREADY\_RETURNED", 409);

}

```



Descrição do problema: A quantidade disponível é incrementada antes da verificação de que o empréstimo já foi devolvido.



Comportamento esperado: Ao tentar devolver novamente um empréstimo, a operação deve ser rejeitada sem modificar a quantidade disponível do livro.



Comportamento atual: A operação retorna `LOAN\_ALREADY\_RETURNED` (HTTP 409), mas o objeto `book` já foi modificado. Caso o repositório mantenha referências aos objetos em memória, a alteração permanece mesmo sem chamar `save`.



Requisito relacionado: CA25, CA26 e RN08.



\### Defeito 3 — Quantidade disponível é definida incorretamente como a quantidade total



Localização: `src/loans/loan.service.js`, método `returnLoan`.



Trecho:



```

book.availableCopies += 1;

// ...

book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: Após incrementar a quantidade disponível em uma unidade, o código substitui esse valor pela quantidade total de exemplares.



Comportamento esperado: Uma devolução válida deve aumentar a quantidade disponível em exatamente uma unidade, preservando os demais empréstimos em aberto.



Comportamento atual: Todos os exemplares passam a constar como disponíveis, independentemente de existirem outros empréstimos ativos.



Exemplo:



| Situação                  | Quantidade disponível |

| ------------------------- | --------------------- |

| Quantidade total do livro | 5                     |

| Antes da devolução        | 2                     |

| Esperada após a devolução | 3                     |

| Atual após a devolução    | 5                     |



Requisito relacionado: CA23.



\### Defeito 4 — Atualização do empréstimo e do livro não é atômica



Localização: `src/loans/loan.service.js`, método `returnLoan`, chamadas de persistência.



Trecho:



```

loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);

book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: As alterações do empréstimo e do livro são persistidas separadamente, sem utilização da função `runInTransaction`, que já é empregada no método `persistLoan`.



Comportamento esperado: A devolução deve atualizar o empréstimo e o estoque de forma atômica. Se alguma etapa falhar, nenhuma alteração deve ser confirmada.



Comportamento atual: Se `loanRepository.save(loan)` for executado com sucesso, mas `bookRepository.save(book)` falhar, o empréstimo poderá ficar registrado como devolvido sem que a atualização do estoque seja concluída. Uma nova tentativa será rejeitada porque o empréstimo já possui `returnDate`.



Requisito relacionado: RN08, CA22, CA23 e CA26.



\## Resumo dos defeitos



| # | Defeito                                                    | Requisitos afetados    |

| - | ---------------------------------------------------------- | ---------------------- |

| 1 | Rejeição indevida de empréstimos atrasados                 | CA24, RN08             |

| 2 | Alteração do estoque antes de rejeitar devolução duplicada | CA25, CA26, RN08       |

| 3 | Estoque redefinido para a quantidade total                 | CA23                   |

| 4 | Persistência não atômica da devolução                      | RN08, CA22, CA23, CA26 |



Conclusão: O Pull Request apresenta quatro defeitos funcionais que justificam solicitar correções antes da aprovação.



A implementação deve aceitar devoluções atrasadas, validar se o empréstimo já foi devolvido antes de modificar qualquer dado, incrementar a disponibilidade em exatamente uma unidade e garantir a atomicidade da operação.



Observação: O risco de alterações persistirem sem `save` depende de como os repositórios armazenam e retornam os objetos. O diff não mostra suas implementações completas. Ainda assim, a ordem das operações e a ausência de uma transação representam problemas funcionais relevantes.

