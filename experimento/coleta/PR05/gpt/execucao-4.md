\## Revisão do Pull Request — RF05 Realizar devolução



Foram identificados 4 defeitos funcionais nas alterações do Pull Request.



\### Defeito 1 — Devoluções atrasadas são rejeitadas



Localização: `src/loans/loan.service.js` — método `returnLoan()` e função `validateLoanIsNotOverdue()`.



Descrição do problema: A implementação impede a devolução quando a data atual é posterior à data prevista do empréstimo.



Comportamento esperado: O sistema deve aceitar a devolução de qualquer empréstimo em aberto, mesmo que esteja atrasado, registrando a data da devolução e atualizando a quantidade disponível.



Comportamento atual: A função `validateLoanIsNotOverdue()` lança `AppError("OVERDUE\_LOAN", 409)` quando `loan.dueDate < currentDate`, rejeitando a operação.



Requisito relacionado: CA24 — A devolução deve ser aceita mesmo quando estiver atrasada.



\### Defeito 2 — Tentativa duplicada altera o estoque antes de ser rejeitada



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



```

book.availableCopies += 1;



if (loan.returnDate) {

&#x20; throw new AppError("LOAN\_ALREADY\_RETURNED", 409);

}

```



Descrição do problema: A quantidade disponível é incrementada antes de verificar se o empréstimo já foi devolvido. Como os repositórios trabalham com objetos mutáveis, a alteração pode afetar o estado armazenado mesmo sem chamar `save()`.



Comportamento esperado: Uma tentativa de devolver um empréstimo já devolvido deve ser rejeitada sem modificar o empréstimo ou a quantidade disponível do livro.



Comportamento atual: O sistema incrementa `book.availableCopies` e depois lança o erro `LOAN\_ALREADY\_RETURNED`. Assim, uma operação rejeitada pode alterar o estoque, inclusive ultrapassando a quantidade total.



Requisitos relacionados:



\- CA25 — Um empréstimo já devolvido não pode ser devolvido novamente.

\- CA26 — Uma tentativa duplicada não pode aumentar novamente a quantidade disponível.

\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.

\- RN09 — A quantidade disponível nunca pode ser negativa nem superior à quantidade total.



\### Defeito 3 — A devolução redefine o estoque para a quantidade total



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



```

loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);

book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: Após incrementar a quantidade disponível em uma unidade, o código sobrescreve esse valor com a quantidade total de exemplares, desconsiderando outros empréstimos ainda em aberto.



Comportamento esperado: Cada devolução válida deve aumentar a quantidade disponível em exatamente uma unidade, preservando os exemplares que continuam emprestados.



Comportamento atual: A primeira devolução faz o sistema considerar todos os exemplares disponíveis, mesmo que existam outros empréstimos em aberto.



Exemplo:



| Informação                               | Valor |

| ---------------------------------------- | ----- |

| Quantidade total                         | 5     |

| Quantidade disponível antes da devolução | 2     |

| Quantidade esperada após a devolução     | 3     |

| Quantidade registrada pelo código        | 5     |



Requisito relacionado: CA23 — A quantidade disponível do livro deve aumentar em uma unidade.



\### Defeito 4 — A devolução não é atômica entre empréstimo e livro



Localização: `src/loans/loan.service.js` — método `returnLoan()`, nas chamadas a `loanRepository.save()` e `bookRepository.save()`.



Descrição do problema: A implementação persiste o empréstimo e o livro separadamente, sem utilizar o mecanismo `runInTransaction()` já empregado no método `persistLoan()`.



Comportamento esperado: O registro da data de devolução e a atualização da disponibilidade devem ocorrer como uma única operação atômica. Se uma das persistências falhar, nenhuma alteração deve permanecer.



Comportamento atual: Se `loanRepository.save(loan)` for concluído e `bookRepository.save(book)` falhar, o empréstimo poderá ficar registrado como devolvido sem que a atualização do estoque seja concluída corretamente. Além disso, o uso de objetos mutáveis pode causar alterações parciais mesmo antes das operações de persistência.



Requisitos relacionados:



\- CA22 — A data da devolução deve ser registrada.

\- CA23 — A quantidade disponível deve aumentar em uma unidade.

\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.



\## Resumo dos defeitos



| # | Defeito                                                 | Requisitos violados    |

| - | ------------------------------------------------------- | ---------------------- |

| 1 | Rejeição de devoluções atrasadas                        | CA24                   |

| 2 | Incremento do estoque antes da validação de duplicidade | CA25, CA26, RN08, RN09 |

| 3 | Estoque redefinido para a quantidade total              | CA23                   |

| 4 | Persistência não atômica da devolução                   | CA22, CA23, RN08       |



Conclusão: O Pull Request apresenta quatro defeitos funcionais que justificam solicitar correções antes da aprovação. Os problemas mais imediatos são a rejeição indevida de devoluções atrasadas, a alteração de estoque em operações rejeitadas e a contabilização incorreta dos exemplares disponíveis.

