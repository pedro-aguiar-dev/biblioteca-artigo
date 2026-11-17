\# Revisão do Pull Request — RF06 Renovar empréstimo



Foram identificados 4 defeitos funcionais no método `renewLoan`, relacionados ao cálculo da nova data prevista, à identificação de empréstimos atrasados, à preservação dos dados em operações rejeitadas e à quantidade disponível de livros.



\## Defeito 1 — Renovação calculada a partir da data da operação



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada adicionando 7 dias à data da operação (`currentDate`), em vez de adicionar 7 dias à data prevista atual (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista atual do empréstimo, independentemente da data da operação.



Comportamento atual: O sistema substitui a data prevista pela data da operação acrescida de 7 dias. Isso pode antecipar o vencimento ou conceder uma quantidade incorreta de dias.



Exemplo:



\- Data da operação: 10/10/2026

\- Data prevista original: 20/10/2026

\- Resultado esperado: 27/10/2026

\- Resultado atual: 17/10/2026



Requisitos relacionados: CA27 e RN02.



\## Defeito 2 — Empréstimos com vencimento no dia da operação são rejeitados



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A comparação utiliza `<=`, fazendo com que empréstimos cuja data prevista seja igual à data da operação sejam considerados atrasados.



Comportamento esperado: Um empréstimo só está atrasado quando sua data prevista é anterior à data da operação. Empréstimos que vencem no próprio dia ainda podem ser renovados, desde que atendam às demais condições.



Comportamento atual: O sistema rejeita a renovação mesmo quando `loan.dueDate` é igual a `operationDate`.



Exemplo:



\- Data prevista: 10/10/2026

\- Data da operação: 10/10/2026

\- Resultado esperado: renovação permitida

\- Resultado atual: erro `OVERDUE\_LOAN` (HTTP 409)



Requisitos relacionados: CA30 e RN07.



\## Defeito 3 — Renovação rejeitada pode modificar a data prevista do empréstimo



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista é modificada antes de verificar se o empréstimo já atingiu o limite de três renovações.



Comportamento esperado: O limite de renovações deve ser validado antes de qualquer alteração nos dados do empréstimo. Uma quarta renovação deve ser rejeitada sem modificar a data prevista nem o contador.



Comportamento atual: Ao tentar realizar a quarta renovação, o código altera `loan.dueDate` antes de lançar a exceção. Embora não execute explicitamente `save`, a alteração pode afetar o estado mantido em memória caso o repositório retorne uma referência ao objeto armazenado.



Exemplo:



\- Quantidade de renovações: 3

\- Data prevista original: 20/10/2026

\- Data da operação: 10/10/2026

\- Resultado esperado: erro `RENEWAL\_LIMIT\_REACHED`, sem qualquer alteração

\- Resultado atual: erro `RENEWAL\_LIMIT\_REACHED`, mas `loan.dueDate` já recebeu `17/10/2026` no objeto carregado



Requisitos relacionados: CA31, CA32, RN03 e RN08.



\## Defeito 4 — Renovação diminui indevidamente a quantidade disponível do livro



Localização: `src/loans/loan.service.js` — método `renewLoan`, na chamada de `persistLoan`, e método `persistLoan`.



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



Descrição do problema: O método `persistLoan` executa uma redução na quantidade disponível do livro, comportamento apropriado à criação de um empréstimo, mas incorreto para sua renovação.



Comportamento esperado: A renovação deve atualizar apenas a data prevista e o contador de renovações, sem modificar a quantidade disponível de exemplares do livro.



Comportamento atual: Cada renovação bem-sucedida reduz `book.availableCopies` em uma unidade, mesmo sem ocorrer um novo empréstimo.



Exemplo:



\- Quantidade disponível antes da renovação: 3

\- Resultado esperado: 3

\- Resultado atual: 2



Além disso, renovações sucessivas podem levar a quantidade disponível a valores negativos.



Requisito relacionado: CA29.



\## Resumo dos defeitos



| ID | Defeito                                                    | Requisitos violados    |

| -- | ---------------------------------------------------------- | ---------------------- |

| 1  | Adiciona 7 dias à data da operação, não à data prevista    | CA27, RN02             |

| 2  | Rejeita renovação no próprio dia do vencimento             | CA30, RN07             |

| 3  | Modifica o objeto antes de rejeitar a quarta renovação     | CA31, CA32, RN03, RN08 |

| 4  | Reduz a quantidade disponível do livro durante a renovação | CA29                   |



Conclusão: O Pull Request apresenta 4 defeitos funcionais, sendo o terceiro dependente da semântica de referências e persistência utilizada pelo repositório. Os demais são diretamente observáveis pelo fluxo do código fornecido.

