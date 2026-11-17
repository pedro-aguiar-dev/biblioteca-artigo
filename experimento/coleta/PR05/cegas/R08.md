\## Revisão do Pull Request — RF05 Realizar devolução



Foram identificados 5 defeitos funcionais nas alterações do Pull Request.



\### Defeito 1 — Devoluções atrasadas são rejeitadas



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



Descrição do problema: A implementação impede a devolução quando a data atual é posterior à data prevista, embora o requisito determine que devoluções atrasadas sejam aceitas.



Comportamento esperado: Um empréstimo em aberto deve poder ser devolvido mesmo após o vencimento, registrando a data de devolução e incrementando a disponibilidade do livro.



Comportamento atual: O sistema lança `OVERDUE\_LOAN` (HTTP 409) e rejeita a devolução.



Requisito relacionado: CA24 — A devolução deve ser aceita mesmo quando estiver atrasada.



\### Defeito 2 — Operações rejeitadas podem alterar a quantidade disponível



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Trecho problemático:



```

book.availableCopies += 1;



if (loan.returnDate) {

&#x20; throw new AppError("LOAN\_ALREADY\_RETURNED", 409);

}

```



Descrição do problema: A quantidade disponível é incrementada antes da verificação de empréstimo já devolvido e antes da validação de atraso.



Como o objeto `book` pode ser uma referência ao objeto armazenado no repositório, a alteração pode permanecer mesmo quando a operação é rejeitada, sem necessidade de chamar `save()`.



Comportamento esperado: Toda validação que possa rejeitar a operação deve ocorrer antes de qualquer alteração persistente. Uma operação rejeitada deve deixar os dados inalterados.



Comportamento atual: Uma tentativa de devolver novamente um empréstimo já devolvido, ou de devolver um empréstimo atrasado, pode incrementar indevidamente `availableCopies`.



Requisitos relacionados:



\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.

\- CA26 — Uma tentativa duplicada não pode aumentar novamente a quantidade disponível.

\- RN09 — A quantidade disponível não pode superar a quantidade total.



\### Defeito 3 — A devolução redefine a disponibilidade para o estoque total



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Trecho problemático:



```

loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);

book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: A implementação substitui a quantidade disponível pela quantidade total de exemplares, ignorando outros empréstimos que ainda estejam em aberto.



Comportamento esperado: Uma devolução válida deve aumentar `availableCopies` em exatamente uma unidade.



Comportamento atual: Todos os exemplares passam a ser considerados disponíveis, mesmo quando existem outros empréstimos ativos.



Exemplo:



| Situação                    | Disponíveis | Total |

| --------------------------- | ----------- | ----- |

| Antes da devolução          | 2           | 5     |

| Após a devolução — esperado | 3           | 5     |

| Após a devolução — atual    | 5           | 5     |



Requisito relacionado: CA23 — A quantidade disponível do livro deve aumentar em uma unidade.



\### Defeito 4 — A devolução não é executada de forma atômica



Localização: `src/loans/loan.service.js` — método `returnLoan()`.



Trecho problemático:



```

loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);

book.availableCopies = book.totalCopies;

await this.bookRepository.save(book);

```



Descrição do problema: O empréstimo e o livro são persistidos em operações separadas, sem utilizar o mecanismo `runInTransaction` já existente na classe.



Se a gravação do livro falhar depois que o empréstimo for salvo, a devolução ficará parcialmente registrada.



Comportamento esperado: A data da devolução e o incremento da disponibilidade devem ser persistidos atomicamente. Caso a operação falhe, nenhuma das alterações deve permanecer.



Comportamento atual: O empréstimo pode ser marcado como devolvido sem que a atualização do estoque seja concluída. Uma nova tentativa será rejeitada como devolução duplicada, impedindo a recuperação normal da disponibilidade.



Requisitos relacionados:



\- RN08 — Uma operação rejeitada não pode modificar os dados do sistema.

\- CA22 — A data da devolução deve ser registrada.

\- CA23 — A quantidade disponível deve aumentar em uma unidade.



\### Defeito 5 — Devoluções simultâneas podem processar o mesmo empréstimo mais de uma vez



Localização: `src/loans/loan.service.js` — método `returnLoan()`, na verificação de `loan.returnDate` e nas operações de persistência.



Trecho problemático:



```

if (loan.returnDate) {

&#x20; throw new AppError("LOAN\_ALREADY\_RETURNED", 409);

}



loan.returnDate = formatDate(currentDate);

const returnedLoan = await this.loanRepository.save(loan);

```



Descrição do problema: A verificação de que o empréstimo ainda está aberto não está protegida contra requisições concorrentes.



Em uma implementação de repositório que devolva instâncias independentes ou permita leituras concorrentes, duas requisições podem consultar o mesmo empréstimo antes de qualquer uma registrar sua devolução. Ambas podem passar pela validação e concluir o processamento.



Comportamento esperado: Apenas uma requisição deve conseguir efetivar a devolução. As demais devem ser rejeitadas sem alterar a data de devolução ou o estoque.



Comportamento atual: Dependendo da implementação do repositório e do controle de concorrência, duas requisições podem ser aceitas para o mesmo empréstimo, permitindo atualizações duplicadas.



Requisitos relacionados:



\- CA25 — Um empréstimo já devolvido não pode ser devolvido novamente.

\- CA26 — Uma tentativa duplicada não pode aumentar novamente a quantidade disponível.



Observação: Este defeito depende do comportamento de concorrência dos repositórios, que não está totalmente visível no diff. É um risco funcional a verificar, não uma falha reproduzível garantida apenas pelo código apresentado.



\## Resumo da revisão



| # | Defeito                                          | Requisitos violados | Severidade sugerida |

| - | ------------------------------------------------ | ------------------- | ------------------- |

| 1 | Rejeição de devoluções atrasadas                 | CA24                | Alta                |

| 2 | Modificação de estoque antes das validações      | RN08, CA26, RN09    | Crítica             |

| 3 | Estoque redefinido para o total                  | CA23                | Crítica             |

| 4 | Persistência não atômica                         | RN08, CA22, CA23    | Alta                |

| 5 | Possibilidade de devolução concorrente duplicada | CA25, CA26          | Alta (condicional)  |



Conclusão: O Pull Request apresenta quatro defeitos diretamente identificáveis no fluxo de devolução e um risco adicional de concorrência dependente da implementação dos repositórios.



A correção deve garantir que a devolução aceite atrasos, valide previamente o estado do empréstimo, incremente o estoque em apenas uma unidade e persista as alterações de forma atômica, impedindo devoluções duplicadas.

