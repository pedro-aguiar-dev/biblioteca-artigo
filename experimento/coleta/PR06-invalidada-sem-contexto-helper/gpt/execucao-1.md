Foram identificados 3 defeitos funcionais no Pull Request, relacionados ao cálculo da nova data prevista, à identificação de empréstimos atrasados e à alteração de dados em operações rejeitadas.



\## Defeito 1 — Renovação calculada a partir da data da operação



Localização: `src/loans/loan.service.js`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada acrescentando 7 dias à data da operação (`currentDate`), em vez de acrescentar 7 dias à data prevista atual (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista existente, independentemente da data em que a renovação é solicitada.



Comportamento atual: O sistema define a nova data prevista como 7 dias após a data da operação, podendo reduzir o prazo do empréstimo.



Exemplo:



\- Data prevista atual: 20/10/2026

\- Data da operação: 10/10/2026

\- Data esperada: 27/10/2026

\- Data produzida: 17/10/2026



Requisitos violados: CA27 e RN02.



Correção sugerida:



```

loan.dueDate = formatDate(addDays(parseDate(loan.dueDate), 7));

```



\## Defeito 2 — Empréstimos com vencimento no dia da operação são rejeitados



Localização: `src/loans/loan.service.js`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A comparação utiliza `<=`, rejeitando empréstimos cuja data prevista é igual à data da operação.



De acordo com RN07, um empréstimo somente está atrasado quando sua data prevista é anterior à data da operação.



Comportamento esperado: Um empréstimo com vencimento na data da operação deve poder ser renovado, desde que esteja em aberto e não tenha atingido o limite de três renovações.



Comportamento atual: O sistema rejeita a renovação com `OVERDUE\_LOAN`, mesmo quando o empréstimo ainda não está atrasado.



Exemplo:



\- Data prevista: 10/10/2026

\- Data da operação: 10/10/2026

\- Resultado esperado: renovação permitida

\- Resultado atual: HTTP 409 — `OVERDUE\_LOAN`



Requisitos violados: CA30 e RN07.



Correção sugerida:



```

if (loan.dueDate < operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



\## Defeito 3 — Alteração da data prevista antes de validar o limite de renovações



Localização: `src/loans/loan.service.js`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista do empréstimo é modificada antes da verificação do limite máximo de três renovações.



Se o empréstimo já possuir três renovações, a operação será rejeitada, mas o objeto `loan` já terá sua data prevista modificada.



Embora `persistLoan` não seja chamado nesse caminho, a alteração antecipada pode afetar os dados mantidos pelo repositório caso `findById` retorne uma referência ao objeto armazenado.



Comportamento esperado: A quarta renovação deve ser rejeitada sem modificar a data prevista nem o contador de renovações.



Comportamento atual: O sistema altera `loan.dueDate` antes de lançar `RENEWAL\_LIMIT\_REACHED`. Dependendo da implementação do repositório, essa alteração pode permanecer no estado do sistema, mesmo após a rejeição.



Exemplo:



\- Quantidade de renovações: 3

\- Data prevista atual: 20/10/2026

\- Data da operação: 15/10/2026

\- Resultado esperado: HTTP 409, mantendo data prevista em 20/10/2026 e contador em 3

\- Resultado atual: HTTP 409, mas com o objeto `loan` já modificado



Requisitos relacionados: CA31, CA32 e RN08.



Correção sugerida: Validar o limite antes de modificar os dados.



```

if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}



loan.dueDate = formatDate(addDays(parseDate(loan.dueDate), 7));

loan.renewalCount += 1;

```



\## Resumo dos defeitos



| # | Defeito                                                     | Requisitos       | Impacto                                           |

| - | ----------------------------------------------------------- | ---------------- | ------------------------------------------------- |

| 1 | Acréscimo de 7 dias à data da operação, não à data prevista | CA27, RN02       | Data prevista incorreta                           |

| 2 | Rejeição de renovação no próprio dia do vencimento          | CA30, RN07       | Renovação válida rejeitada                        |

| 3 | Modificação da data antes da validação do limite            | CA31, CA32, RN08 | Risco de alteração de dados em operação rejeitada |



Conclusão: Os defeitos 1 e 2 são diretamente demonstráveis pelo código apresentado. O defeito 3 representa uma violação potencial de integridade, cuja persistência depende da implementação do repositório.



Não foram identificadas alterações explícitas na quantidade disponível de livros durante a renovação. Entretanto, como a implementação de `persistLoan` não foi apresentada integralmente, não é possível confirmar o atendimento ao CA29 apenas com o diff fornecido.

