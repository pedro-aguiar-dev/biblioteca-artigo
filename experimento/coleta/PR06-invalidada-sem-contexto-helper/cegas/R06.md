Foram identificados 3 defeitos funcionais na implementação de `renewLoan`, relacionados ao cálculo da nova data prevista, à identificação de empréstimos atrasados e à alteração de dados em operações rejeitadas.



\## Defeito 1 — Renovação calculada a partir da data da operação



Localização: `src/loans/loan.service.js`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada somando 7 dias à data da operação (`currentDate`), e não à data prevista atual do empréstimo (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista existente, independentemente do dia em que a renovação for solicitada.



Comportamento atual: O sistema substitui a data prevista pela data da operação acrescida de 7 dias, podendo antecipar ou reduzir indevidamente o prazo do empréstimo.



Exemplo:



\- Data prevista atual: 20/10/2026.

\- Data da renovação: 15/10/2026.

\- Resultado esperado: 27/10/2026.

\- Resultado atual: 22/10/2026.



Requisitos relacionados: CA27 e RN02.



\## Defeito 2 — Empréstimo com vencimento na data da operação é rejeitado indevidamente



Localização: `src/loans/loan.service.js`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: O operador `<=` considera atrasados os empréstimos cuja data prevista é igual à data da operação. Entretanto, a RN07 estabelece que um empréstimo está atrasado somente quando a data prevista é anterior à data da operação.



Comportamento esperado: Um empréstimo com vencimento no próprio dia da operação deve poder ser renovado, desde que esteja em aberto e não tenha atingido o limite de três renovações.



Comportamento atual: A operação é rejeitada com `OVERDUE\_LOAN`, mesmo quando o empréstimo ainda não está atrasado.



Exemplo:



\- Data prevista atual: 09/10/2026.

\- Data da operação: 09/10/2026.

\- Quantidade de renovações: 1.

\- Resultado esperado: renovação aceita, com data prevista em 16/10/2026 e contador igual a 2.

\- Resultado atual: erro `OVERDUE\_LOAN` (409).



Requisitos relacionados: RF06, CA30 e RN07.



\## Defeito 3 — Operação rejeitada altera a data prevista do empréstimo em memória



Localização: `src/loans/loan.service.js`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista do empréstimo é modificada antes da validação do limite máximo de renovações.



Quando o empréstimo já possui três renovações, a operação lança uma exceção, mas o objeto `loan` já teve sua data alterada.



Comportamento esperado: O limite de renovações deve ser validado antes de qualquer alteração. Uma quarta renovação deve ser rejeitada sem modificar a data prevista nem o contador.



Comportamento atual: A quarta renovação é rejeitada, porém a data prevista do objeto em memória já foi modificada. Dependendo da implementação do repositório e do gerenciamento das entidades, essa alteração pode ficar observável ou ser persistida, mesmo sem executar `persistLoan`.



Exemplo:



\- Data prevista atual: 20/10/2026.

\- Data da operação: 15/10/2026.

\- Quantidade de renovações: 3.

\- Resultado esperado: erro `RENEWAL\_LIMIT\_REACHED`, mantendo a data em 20/10/2026 e o contador em 3.

\- Resultado atual: erro `RENEWAL\_LIMIT\_REACHED`, com `loan.dueDate` alterada para 22/10/2026 em memória e o contador mantido em 3.



Requisitos relacionados: CA31, CA32, RN03 e RN08.



A violação persistente de CA32/RN08 depende do comportamento do repositório, que não foi apresentado no diff.



\## Resumo da revisão



| Defeito | Problema                                                  | Requisitos             |

| ------- | --------------------------------------------------------- | ---------------------- |

| 1       | Soma 7 dias à data da operação, não à data prevista atual | CA27, RN02             |

| 2       | Rejeita empréstimos que vencem no próprio dia             | CA30, RN07             |

| 3       | Modifica a data antes de validar o limite de renovações   | CA31, CA32, RN03, RN08 |



Conclusão: O Pull Request contém 2 defeitos funcionais confirmados e 1 defeito potencial relacionado ao estado do objeto em uma operação rejeitada.



Não há evidências suficientes no trecho apresentado para afirmar uma violação de CA28 (incremento do contador) ou CA29 (quantidade disponível).

