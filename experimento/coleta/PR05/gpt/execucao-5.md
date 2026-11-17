\# Revisão de código — PR RF05: Realizar devolução



Foram identificados 4 defeitos funcionais no Pull Request, considerando os requisitos e as regras de negócio fornecidos.



\## Defeito 1 — Devolução de empréstimos atrasados é rejeitada



Localização: `src/loans/loan.service.js` — função `validateLoanIsNotOverdue()` e sua chamada em `returnLoan()`.



Código problemático:



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



Descrição do problema: A implementação impede a devolução de empréstimos cuja data prevista já tenha passado, embora o requisito determine explicitamente que devoluções atrasadas devem ser aceitas.



Comportamento esperado: Permitir a devolução independentemente de a data atual ser posterior à data prevista, registrando a data de devolução e atualizando a disponibilidade do livro.



Comportamento atual: O sistema lança `OVERDUE\_LOAN` (HTTP 409) e rejeita a devolução.



Requisito relacionado: CA24 — A devolução deve ser aceita mesmo quando estiver atrasada.



\## Defeito 2 — Tentativa duplicada modifica a quantidade disponível antes da rejeição



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Código problemático:



```

book.availableCopies += 1;



if (loan.returnDate) {

&#x20; throw new AppError("LOAN\_ALREADY\_RETURNED", 409);

}

```



Descrição do problema: A quantidade disponível do livro é incrementada antes da verificação de que o empréstimo já foi devolvido.



Como `bookRepository.findOne()` pode retornar uma referência ao objeto armazenado, essa alteração pode modificar o estado do repositório mesmo sem chamar `save()`.



Comportamento esperado: Verificar se o empréstimo já foi devolvido antes de qualquer alteração. Uma tentativa duplicada deve ser rejeitada sem modificar os dados.



Comportamento atual: O sistema lança `LOAN\_ALREADY\_RETURNED` (HTTP 409), mas a quantidade disponível pode já ter sido incrementada em memória.



Requisitos relacionados:



\- CA25 — Um empréstimo já devolvido não pode ser devolvido novamente.

\- CA26 — Uma tentativa duplicada não pode aumentar novamente a quantidade disponível.

\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.

\- RN09 — A quantidade disponível nunca pode ser superior à quantidade total.



\## Defeito 3 — Devolução redefine a disponibilidade para o estoque total



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Código problemático:



```

book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: Após registrar a devolução, a implementação define a quantidade disponível como igual à quantidade total do livro, ignorando outras unidades que continuam emprestadas.



Comportamento esperado: Uma devolução válida deve aumentar a quantidade disponível em exatamente uma unidade, preservando a indisponibilidade das demais unidades emprestadas.



Comportamento atual: O livro passa a ter todas as unidades disponíveis, mesmo que existam outros empréstimos em aberto.



Exemplo:



| Situação                           | Disponíveis |

| ---------------------------------- | ----------- |

| Quantidade total                   | 5           |

| Antes da devolução                 | 2           |

| Esperado após devolver uma unidade | 3           |

| Resultado atual                    | 5           |



Requisito relacionado: CA23 — A quantidade disponível do livro deve aumentar em uma unidade.



\## Defeito 4 — Falta de atomicidade entre atualização do empréstimo e do livro



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Código problemático:



```

loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);



book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: As duas operações de persistência são executadas separadamente, sem uma transação que garanta a atomicidade.



O próprio serviço já utiliza `runInTransaction()` no método `persistLoan()`, mas a nova operação de devolução não utiliza esse mecanismo.



Comportamento esperado: O registro da data de devolução e o incremento da quantidade disponível devem ocorrer de forma atômica. Se alguma etapa falhar, nenhuma alteração deve ser efetivada.



Comportamento atual: Se a atualização do empréstimo for concluída e a persistência do livro falhar, a devolução poderá ficar registrada sem a correspondente atualização consistente do estoque. A operação retorna erro, mas pode deixar alterações persistidas.



Requisitos relacionados:



\- CA22 — A data da devolução deve ser registrada.

\- CA23 — A quantidade disponível do livro deve aumentar em uma unidade.

\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.



\## Resumo dos defeitos



| # | Defeito                                                       | Requisitos violados    |

| - | ------------------------------------------------------------- | ---------------------- |

| 1 | Rejeição de devoluções atrasadas                              | CA24                   |

| 2 | Alteração de estoque antes de rejeitar devolução duplicada    | CA25, CA26, RN08, RN09 |

| 3 | Redefinição incorreta da disponibilidade para o estoque total | CA23                   |

| 4 | Ausência de atomicidade na persistência da devolução          | CA22, CA23, RN08       |



Conclusão: O Pull Request apresenta quatro defeitos funcionais. Os defeitos 1 e 3 violam diretamente os critérios de aceitação; o defeito 2 pode modificar dados em uma operação rejeitada; e o defeito 4 pode produzir inconsistências quando ocorre uma falha parcial de persistência.



A correção deve garantir que a devolução de um empréstimo em aberto seja aceita mesmo em atraso, que a disponibilidade aumente em exatamente uma unidade e que todas as alterações sejam realizadas atomicamente, somente após as validações necessárias.

