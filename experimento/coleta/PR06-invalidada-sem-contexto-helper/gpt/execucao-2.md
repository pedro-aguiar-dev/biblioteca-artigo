\## Revisão do Pull Request — RF06 Renovar empréstimo



Foram identificados 3 defeitos funcionais na implementação de `renewLoan`, todos localizados em `src/loans/loan.service.js`.



\### Defeito 1 — Renovação acrescenta 7 dias à data da operação, e não à data prevista



Localização: `src/loans/loan.service.js`, método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada a partir de `currentDate`, quando deveria ser calculada a partir da data prevista atual (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista existente.



Comportamento atual: A data prevista é substituída pela data da operação acrescida de 7 dias. Se a renovação ocorrer antes do vencimento, o prazo resultante poderá ser menor que o devido.



Exemplo:



\- Data prevista original: 20/10/2026

\- Data da renovação: 15/10/2026

\- Resultado esperado: 27/10/2026

\- Resultado atual: 22/10/2026



Requisitos relacionados: CA27 e RN02.



\### Defeito 2 — Empréstimo com vencimento no dia da operação é incorretamente considerado atrasado



Localização: `src/loans/loan.service.js`, método `renewLoan`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A comparação utiliza `<=`, rejeitando também empréstimos cuja data prevista é igual à data da operação.



Segundo RN07, um empréstimo está atrasado apenas quando sua data prevista é anterior à data da operação.



Comportamento esperado: Permitir a renovação de um empréstimo que vence no próprio dia da operação, desde que esteja em aberto e não tenha atingido o limite de renovações.



Comportamento atual: O sistema lança `OVERDUE\_LOAN` e rejeita a renovação quando `loan.dueDate === operationDate`.



Exemplo:



\- Data prevista: 20/10/2026

\- Data da operação: 20/10/2026

\- Resultado esperado: renovação permitida

\- Resultado atual: renovação rejeitada com HTTP 409



Requisitos relacionados: CA30 e RN07.



\### Defeito 3 — Renovação rejeitada pode modificar a data prevista do empréstimo



Localização: `src/loans/loan.service.js`, método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista é alterada antes da validação do limite máximo de três renovações.



Quando `loan.renewalCount >= 3`, a operação é rejeitada, porém o objeto `loan` já teve sua data modificada.



Comportamento esperado: Validar o limite de renovações antes de modificar qualquer dado do empréstimo. Uma quarta renovação deve ser rejeitada sem alterar a data prevista nem o contador.



Comportamento atual: A operação lança `RENEWAL\_LIMIT\_REACHED` após modificar `loan.dueDate` em memória. Caso o repositório mantenha referências compartilhadas ou rastreie alterações automaticamente, essa modificação poderá afetar o estado persistido, mesmo sem a chamada a `persistLoan`.



Requisitos relacionados: CA31, CA32, RN03 e RN08.



\## Resumo dos defeitos



| # | Defeito                                            | Requisitos violados    |

| - | -------------------------------------------------- | ---------------------- |

| 1 | Cálculo da nova data usa a data da operação        | CA27, RN02             |

| 2 | Renovação é rejeitada no próprio dia do vencimento | CA30, RN07             |

| 3 | Data é modificada antes da validação do limite     | CA31, CA32, RN03, RN08 |



\## Correção sugerida



O trecho principal de `renewLoan` pode ser corrigido da seguinte forma:



```

const operationDate = formatDate(currentDate);



if (loan.dueDate < operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}



loan.dueDate = formatDate(

&#x20; addDays(parseDate(loan.dueDate), 7)

);



loan.renewalCount += 1;



const book = await this.bookRepository.findOne({

&#x20; id: loan.bookId

});



return this.persistLoan(loan, book);

```



Essa correção pressupõe que `parseDate` aceita o formato armazenado em `loan.dueDate`.



Conclusão: O Pull Request apresenta três defeitos funcionais identificáveis. Os dois primeiros produzem comportamentos incorretos diretamente demonstráveis pelo código. O terceiro representa um risco de alteração indevida de estado, cuja persistência efetiva depende da implementação do repositório. Não há evidência suficiente no diff para afirmar que a quantidade disponível do livro seja alterada durante a renovação.

