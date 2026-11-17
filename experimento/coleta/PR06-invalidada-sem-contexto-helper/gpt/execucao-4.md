\## Revisão do Pull Request — RF06 Renovar empréstimo



Foram identificados 3 defeitos funcionais na implementação de `renewLoan`, todos localizados em `src/loans/loan.service.js`.



\### Defeito 1 — Renovação acrescenta 7 dias à data da operação, e não à data prevista



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada a partir de `currentDate`, quando deveria ser calculada a partir da data prevista atual (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista existente.



Comportamento atual: O sistema define a data prevista como 7 dias após a data da operação, podendo antecipar o vencimento do empréstimo.



Exemplo:



\- Data prevista original: 20/10/2026

\- Data da operação: 10/10/2026

\- Data esperada após renovação: 27/10/2026

\- Data produzida pelo código: 17/10/2026



Requisitos relacionados: CA27 e RN02.



\### Defeito 2 — Empréstimo com vencimento no dia da operação é rejeitado incorretamente



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A condição utiliza `<=`, rejeitando empréstimos cuja data prevista seja igual à data da operação.



De acordo com a RN07, um empréstimo está atrasado somente quando a data prevista é anterior à data da operação.



Comportamento esperado: Um empréstimo com vencimento no próprio dia da operação deve poder ser renovado, desde que esteja em aberto e não tenha atingido o limite de renovações.



Comportamento atual: O sistema rejeita a renovação com `OVERDUE\_LOAN`, mesmo que o empréstimo ainda não esteja atrasado.



Exemplo:



\- Data prevista: 10/10/2026

\- Data da operação: 10/10/2026

\- Resultado esperado: renovação permitida

\- Resultado atual: HTTP 409 — `OVERDUE\_LOAN`



Requisitos relacionados: RF06, CA30 e RN07.



\### Defeito 3 — Renovação rejeitada altera a data prevista do objeto de empréstimo



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista é alterada antes da validação do limite máximo de três renovações.



Quando `loan.renewalCount >= 3`, a operação é rejeitada, mas o objeto `loan` já teve sua data prevista modificada.



Embora `persistLoan` não seja chamado nesse caminho, a alteração pode permanecer no estado do repositório caso `findById` retorne uma referência ao objeto armazenado.



Comportamento esperado: Ao tentar realizar uma quarta renovação, a operação deve ser rejeitada sem modificar a data prevista nem o contador de renovações.



Comportamento atual: A quarta renovação é rejeitada, porém a data prevista já foi modificada no objeto carregado. Dependendo da implementação do repositório, essa alteração pode afetar o estado armazenado.



Requisitos relacionados: CA31, CA32 e RN08.



\## Resumo dos defeitos



| # | Defeito                                                      | Requisitos violados |

| - | ------------------------------------------------------------ | ------------------- |

| 1 | Data calculada a partir da operação, em vez da data prevista | CA27, RN02          |

| 2 | Renovação rejeitada indevidamente no dia do vencimento       | CA30, RN07          |

| 3 | Data alterada antes da validação do limite de renovações     | CA31, CA32, RN08    |



Conclusão: O Pull Request apresenta 2 defeitos funcionais confirmados e 1 defeito potencial dependente do comportamento do repositório.



Não foram identificadas violações demonstráveis de CA28 (incremento do contador) ou CA29 (quantidade disponível) no trecho apresentado.

