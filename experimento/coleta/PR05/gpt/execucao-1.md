\# Revisão do Pull Request — RF05 Realizar devolução



Foram identificados 4 defeitos funcionais nas alterações, relacionados à devolução de empréstimos, à atualização do estoque e à integridade dos dados.



\## Defeito 1 — Devolução de empréstimos atrasados é rejeitada



Localização: `src/loans/loan.service.js` — função `validateLoanIsNotOverdue()` e sua chamada em `returnLoan()`.



Trecho problemático:



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



Descrição do problema: A implementação rejeita a devolução quando a data atual é posterior à data prevista do empréstimo. Entretanto, a regra de negócio exige que devoluções atrasadas sejam aceitas.



Comportamento esperado: Um empréstimo em aberto deve poder ser devolvido mesmo após a data prevista, registrando sua data de devolução e incrementando a quantidade disponível do livro.



Comportamento atual: A operação lança `OVERDUE\_LOAN` com HTTP 409, impedindo a devolução.



Requisito relacionado: CA24 — A devolução deve ser aceita mesmo quando estiver atrasada.



\## Defeito 2 — Tentativa de devolução duplicada modifica o estoque



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Trecho problemático:



```

book.availableCopies += 1;



if (loan.returnDate) {

&#x20; throw new AppError("LOAN\_ALREADY\_RETURNED", 409);

}

```



Descrição do problema: A quantidade disponível é incrementada antes da verificação de que o empréstimo já foi devolvido.



Como `book` é um objeto obtido do repositório, a alteração pode afetar diretamente o objeto armazenado, mesmo sem executar `bookRepository.save()`.



Comportamento esperado: O sistema deve verificar se o empréstimo já foi devolvido antes de modificar o estoque. Uma tentativa duplicada deve ser rejeitada sem alterar nenhum dado.



Comportamento atual: A operação retorna HTTP 409, mas o incremento já foi realizado no objeto `book`. Caso o repositório mantenha referências aos objetos armazenados, o estoque é alterado mesmo com a operação rejeitada.



Requisitos relacionados:



\- CA25 — Um empréstimo já devolvido não pode ser devolvido novamente.

\- CA26 — Uma tentativa duplicada não pode aumentar novamente a quantidade disponível.

\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.

\- RN09 — A quantidade disponível nunca pode ser superior à quantidade total.



\## Defeito 3 — Devolução redefine incorretamente a disponibilidade para o estoque total



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Trecho problemático:



```

loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);



book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: Após registrar a devolução, o código define a quantidade disponível como a quantidade total do livro, ignorando outros empréstimos que ainda possam estar em aberto.



Comportamento esperado: Cada devolução deve aumentar a quantidade disponível em exatamente uma unidade, preservando a quantidade de exemplares que continuam emprestados.



Comportamento atual: O sistema considera todos os exemplares disponíveis após a devolução de apenas um empréstimo.



Exemplo:



| Situação                                 | Quantidade |

| ---------------------------------------- | ---------- |

| Quantidade total                         | 5          |

| Quantidade disponível antes da devolução | 2          |

| Quantidade esperada após a devolução     | 3          |

| Quantidade definida pelo código          | 5          |



Requisito relacionado: CA23 — A quantidade disponível do livro deve aumentar em uma unidade.



\## Defeito 4 — Atualização do empréstimo e do estoque não é atômica



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Trecho problemático:



```

loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);

book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: O empréstimo e o livro são persistidos separadamente, sem utilização da função `runInTransaction()`, já empregada no método `persistLoan()`.



Se a gravação do empréstimo for concluída, mas a gravação do livro falhar, a operação poderá deixar os dados inconsistentes.



Comportamento esperado: O registro da devolução e o incremento da disponibilidade devem constituir uma operação atômica. Se alguma etapa falhar, nenhuma das alterações deve ser persistida.



Comportamento atual: Uma falha em `bookRepository.save(book)` pode ocorrer depois de `loanRepository.save(loan)` ter registrado a devolução, deixando o empréstimo devolvido sem a correspondente atualização consistente do estoque.



Requisitos relacionados:



\- CA22 — A data da devolução deve ser registrada.

\- CA23 — A quantidade disponível do livro deve aumentar em uma unidade.

\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.



\## Resumo dos defeitos



| # | Defeito                                                      | Requisitos violados    |

| - | ------------------------------------------------------------ | ---------------------- |

| 1 | Rejeição de devoluções atrasadas                             | CA24                   |

| 2 | Modificação do estoque antes de rejeitar devolução duplicada | CA25, CA26, RN08, RN09 |

| 3 | Redefinição da quantidade disponível para a quantidade total | CA23                   |

| 4 | Persistência não atômica da devolução e do estoque           | CA22, CA23, RN08       |



Conclusão: O Pull Request apresenta quatro defeitos funcionais. Os defeitos 1 e 3 violam diretamente os critérios de aceitação; os defeitos 2 e 4 introduzem riscos à integridade dos dados. O defeito 2 depende do comportamento de referência dos objetos no repositório, enquanto o defeito 4 se manifesta quando ocorre falha durante a persistência.

