\# Revisão do Pull Request — RF06 Renovar empréstimo



Foram identificados 4 defeitos funcionais na implementação de `renewLoan`, considerando os requisitos e as regras de negócio fornecidos.



\## Defeito 1 — Renovação rejeitada quando realizada na data de vencimento



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A condição utiliza `<=`, rejeitando empréstimos cuja data prevista seja igual à data da operação. Entretanto, RN07 estabelece que um empréstimo está atrasado apenas quando a data prevista é anterior à data da operação.



Comportamento esperado: Permitir a renovação quando `dueDate === operationDate`, desde que as demais condições sejam atendidas.



Comportamento atual: O sistema rejeita a renovação com `OVERDUE\_LOAN`, mesmo quando o empréstimo ainda não está atrasado.



Requisito relacionado: CA30 e RN07.



\## Defeito 2 — Nova data prevista calculada a partir da data da operação



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A implementação acrescenta sete dias à data da operação (`currentDate`), em vez de acrescentá-los à data prevista atual (`loan.dueDate`).



Comportamento esperado: A nova data prevista deve ser calculada somando sete dias à data prevista existente.



Comportamento atual: A data prevista é substituída pela data da operação acrescida de sete dias, podendo reduzir indevidamente o prazo de devolução.



Exemplo:



\- Data da operação: 10/10/2026

\- Data prevista original: 20/10/2026

\- Resultado esperado: 27/10/2026

\- Resultado atual: 17/10/2026



Requisito relacionado: CA27 e RN02.



\## Defeito 3 — Alteração da data prevista antes da validação do limite de renovações



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista é modificada antes de verificar se o empréstimo já atingiu o limite de três renovações.



Como `loan` pode ser uma referência ao objeto mantido em memória pelo repositório, essa alteração pode permanecer no estado do sistema mesmo após a exceção, dependendo da implementação do repositório.



Comportamento esperado: A quarta renovação deve ser rejeitada sem modificar a data prevista nem o contador de renovações.



Comportamento atual: A operação lança `RENEWAL\_LIMIT\_REACHED`, mas a data prevista já foi alterada no objeto `loan`. Em repositórios que mantêm referências aos objetos, a alteração pode ser observável mesmo sem chamar `save`.



Requisito relacionado: CA31, CA32, RN03 e RN08.



\## Defeito 4 — Renovação reduz indevidamente a quantidade disponível do livro



Localização: `src/loans/loan.service.js` — método `renewLoan`, na chamada a `persistLoan`, e método `persistLoan`.



```

const book = await this.bookRepository.findOne({ id: loan.bookId });

return this.persistLoan(loan, book);

```



O método reutilizado executa:



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



Descrição do problema: `persistLoan` contém uma regra específica da criação de empréstimos: diminuir a quantidade disponível do livro. Ao reutilizá-lo na renovação, essa diminuição também é executada.



Comportamento esperado: Renovar o empréstimo sem alterar `book.availableCopies`.



Comportamento atual: Cada renovação bem-sucedida diminui a quantidade disponível em uma unidade, embora nenhum novo exemplar esteja sendo emprestado.



Exemplo:



\- Quantidade disponível antes da renovação: 5

\- Quantidade disponível esperada após a renovação: 5

\- Quantidade disponível atual após a renovação: 4



Requisito relacionado: CA29.



\## Resumo dos defeitos



| # | Defeito                                               | Requisitos violados    |

| - | ----------------------------------------------------- | ---------------------- |

| 1 | Rejeição indevida na data de vencimento               | CA30, RN07             |

| 2 | Acréscimo de sete dias à data errada                  | CA27, RN02             |

| 3 | Mutação de dados antes de rejeitar a quarta renovação | CA31, CA32, RN03, RN08 |

| 4 | Redução indevida da quantidade disponível             | CA29                   |



Conclusão: O Pull Request apresenta três defeitos diretamente verificáveis no fluxo de renovação e um defeito de potencial violação de atomicidade, condicionado à semântica de referências do repositório (defeito 3). O incremento do contador em uma unidade (CA28) está implementado corretamente no fluxo de sucesso.

