\# Revisão de Código — RF06: Renovar empréstimo



Foram identificados 4 defeitos funcionais no Pull Request, relacionados ao cálculo da nova data prevista, à validação de atraso, à preservação dos dados em operações rejeitadas e à alteração indevida do estoque.



\## Defeito 1 — Renovação calculada a partir da data da operação



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada somando 7 dias à data da operação (`currentDate`), em vez de somar 7 dias à data prevista atual (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista existente.



Comportamento atual: Quando a renovação é realizada antes do vencimento, o empréstimo pode receber uma data prevista incorreta, inclusive anterior à data prevista original.



Exemplo:



\- Data prevista atual: 20/10/2026.

\- Data da renovação: 10/10/2026.

\- Data esperada: 27/10/2026.

\- Data produzida: 17/10/2026.



Requisitos relacionados: CA27 e RN02.



\## Defeito 2 — Renovação rejeitada no próprio dia do vencimento



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A condição utiliza `<=`, considerando atrasado um empréstimo cuja data prevista é igual à data da operação.



Segundo a RN07, um empréstimo só está atrasado quando sua data prevista é anterior à data da operação.



Comportamento esperado: Uma renovação realizada no próprio dia do vencimento deve ser permitida, desde que os demais requisitos sejam atendidos.



Comportamento atual: O sistema rejeita a renovação com `OVERDUE\_LOAN`, mesmo quando o empréstimo ainda não está atrasado.



Exemplo:



\- Data prevista: 15/10/2026.

\- Data da renovação: 15/10/2026.

\- Resultado esperado: renovação permitida.

\- Resultado atual: HTTP 409 (`OVERDUE\_LOAN`).



Requisitos relacionados: CA30 e RN07.



\## Defeito 3 — Alteração da data prevista antes da validação do limite de renovações



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista é modificada antes de verificar se o empréstimo já atingiu o limite de três renovações.



Se o objeto retornado por `findById` for uma referência à entidade mantida pelo repositório, a alteração poderá permanecer em memória mesmo quando a operação for rejeitada.



Comportamento esperado: Ao tentar realizar a quarta renovação, o sistema deve rejeitar a operação sem modificar a data prevista nem o contador de renovações.



Comportamento atual: A operação lança `RENEWAL\_LIMIT\_REACHED`, mas a data prevista já foi alterada no objeto `loan`. Dependendo da implementação do repositório, essa modificação poderá afetar os dados persistidos, mesmo sem chamar `save`.



Requisitos relacionados: CA31, CA32 e RN08.



\## Defeito 4 — Renovação reduz indevidamente a quantidade disponível do livro



Localização: `src/loans/loan.service.js` — método `renewLoan`, na chamada a `persistLoan`



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



Descrição do problema: O método `persistLoan` diminui em uma unidade a quantidade disponível do livro. Essa operação é apropriada para registrar um novo empréstimo, mas não para renovar um empréstimo existente.



Comportamento esperado: A renovação deve atualizar apenas os dados do empréstimo necessários à renovação, mantendo inalterada a quantidade disponível do livro.



Comportamento atual: A cada renovação bem-sucedida, a quantidade disponível diminui em uma unidade.



Exemplo:



\- Quantidade disponível antes da renovação: 5.

\- Quantidade disponível esperada após a renovação: 5.

\- Quantidade disponível atual após a renovação: 4.



Renovações sucessivas podem causar inconsistências no controle de estoque, inclusive valores negativos.



Requisito relacionado: CA29.



\## Resumo dos defeitos



| # | Defeito                                              | Requisitos violados |

| - | ---------------------------------------------------- | ------------------- |

| 1 | Cálculo da nova data a partir de `currentDate`       | CA27, RN02          |

| 2 | Rejeição indevida no dia do vencimento               | CA30, RN07          |

| 3 | Modificação antecipada da data em operação rejeitada | CA31, CA32, RN08    |

| 4 | Redução indevida da quantidade disponível            | CA29                |



Conclusão: O Pull Request apresenta três defeitos diretamente demonstráveis pelo fluxo do código (1, 2 e 4) e um defeito potencial de integridade de dados (3), cuja manifestação depende da semântica do repositório.



O contador de renovações é incrementado corretamente nas operações bem-sucedidas (CA28), e a verificação `renewalCount >= 3` impede a quarta renovação (CA31). Entretanto, a ordem das operações precisa ser corrigida para garantir que a rejeição não altere dados existentes.

