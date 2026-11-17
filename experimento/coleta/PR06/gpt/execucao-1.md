\# Revisão de Código — PR: Renovação de Empréstimos



Foram identificados 4 defeitos funcionais na implementação de `renewLoan`, considerando os requisitos e as regras de negócio fornecidos.



\## Defeito 1 — Renovação acrescenta 7 dias à data errada



Localização: `src/loans/loan.service.js` — método `renewLoan`



Código problemático:



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada com base na data da operação (`currentDate`), em vez da data prevista atual do empréstimo (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista atual, independentemente da data em que a renovação foi solicitada.



Comportamento atual: A data prevista passa a ser 7 dias após a data da operação, podendo inclusive antecipar o vencimento original.



Exemplo:



\- Data prevista atual: 20/10/2026

\- Data da renovação: 10/10/2026

\- Resultado esperado: 27/10/2026

\- Resultado atual: 17/10/2026



Requisitos relacionados: CA27 e RN02.



\## Defeito 2 — Empréstimos com vencimento na data da operação são rejeitados



Localização: `src/loans/loan.service.js` — método `renewLoan`



Código problemático:



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A condição utiliza `<=`, rejeitando também empréstimos cuja data prevista é igual à data da operação.



Conforme RN07, um empréstimo somente está atrasado quando sua data prevista é anterior à data da operação.



Comportamento esperado: Um empréstimo com vencimento no próprio dia da operação pode ser renovado, desde que os demais critérios sejam atendidos.



Comportamento atual: O sistema rejeita a renovação com `OVERDUE\_LOAN`, mesmo que o empréstimo ainda não esteja atrasado.



Correção sugerida:



```

if (loan.dueDate < operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Requisitos relacionados: CA30 e RN07.



\## Defeito 3 — Renovação altera indevidamente a quantidade disponível do livro



Localização: `src/loans/loan.service.js` — método `renewLoan`, na chamada de `persistLoan`



Código problemático:



```

const book = await this.bookRepository.findOne({ id: loan.bookId });

return this.persistLoan(loan, book);

```



O método reutilizado contém:



```

async persistLoan(loan, book) {

&#x20; return runInTransaction(

&#x20;   \[this.loanRepository, this.bookRepository],

&#x20;   async () => {

&#x20;     book.availableCopies -= 1;

&#x20;     const createdLoan = await this.loanRepository.save(loan);

&#x20;     await this.bookRepository.save(book);

&#x20;     return createdLoan;

&#x20;   }

&#x20; );

}

```



Descrição do problema: `persistLoan` foi implementado para registrar empréstimos e diminuir a quantidade disponível do livro. Sua reutilização na renovação provoca uma redução indevida no estoque.



Comportamento esperado: A renovação deve atualizar somente a data prevista e o contador de renovações, preservando a quantidade disponível do livro.



Comportamento atual: Cada renovação diminui `availableCopies` em uma unidade.



Exemplo:



\- Quantidade disponível antes da renovação: 3

\- Quantidade esperada após a renovação: 3

\- Quantidade atual após a renovação: 2



Renovações sucessivas podem diminuir o estoque disponível sem que novos empréstimos sejam realizados.



Requisito relacionado: CA29.



\## Defeito 4 — Data prevista é modificada antes da validação do limite de renovações



Localização: `src/loans/loan.service.js` — método `renewLoan`



Código problemático:



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista do empréstimo é modificada antes de verificar se o limite de três renovações já foi atingido.



Quando `renewalCount >= 3`, a operação é rejeitada, mas o objeto `loan` já sofreu uma alteração.



Comportamento esperado: O limite deve ser validado antes de qualquer modificação. Uma quarta renovação deve ser rejeitada sem alterar a data prevista nem o contador.



Comportamento atual: A quarta renovação é rejeitada, mas `loan.dueDate` já foi modificado em memória. Caso o repositório mantenha referências aos objetos armazenados, essa alteração pode persistir mesmo sem uma chamada explícita a `save`, violando a atomicidade da operação rejeitada.



Correção sugerida:



```

if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}



loan.dueDate = formatDate(addDays(parseDate(loan.dueDate), 7));

loan.renewalCount += 1;

```



Requisitos relacionados: CA31, CA32, RN03 e RN08.



\## Resumo dos defeitos



| # | Defeito funcional                                    | Requisitos violados    |

| - | ---------------------------------------------------- | ---------------------- |

| 1 | Calcula a renovação a partir da data da operação     | CA27, RN02             |

| 2 | Rejeita empréstimos que vencem no dia da operação    | CA30, RN07             |

| 3 | Reduz indevidamente a quantidade disponível do livro | CA29                   |

| 4 | Modifica a data antes de rejeitar a quarta renovação | CA31, CA32, RN03, RN08 |



Conclusão: O Pull Request apresenta 3 defeitos diretamente verificáveis pelo código e 1 defeito potencial de integridade de dados, cuja manifestação depende do comportamento do repositório. A implementação necessita de correções para atender integralmente aos requisitos de renovação.



O incremento do contador em uma unidade (CA28) está implementado corretamente para renovações aceitas; não foi identificado defeito específico nesse ponto.

