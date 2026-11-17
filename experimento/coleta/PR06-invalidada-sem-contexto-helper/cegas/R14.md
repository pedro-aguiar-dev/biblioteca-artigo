\## Revisão do Pull Request — RF06 Renovar empréstimo



Foram identificados 3 defeitos funcionais nas alterações do método `renewLoan`, em `src/loans/loan.service.js`.



\### Defeito 1 — Renovação acrescenta 7 dias à data da operação, em vez da data prevista atual



Localização: `src/loans/loan.service.js`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada a partir de `currentDate`, quando deveria ser calculada a partir da data prevista atual do empréstimo (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista atual.



Comportamento atual: A data prevista passa a ser 7 dias após a data da operação, podendo antecipar o vencimento ou conceder menos de 7 dias adicionais.



Exemplo:



\- Data da operação: 10/10/2026

\- Data prevista atual: 15/10/2026

\- Resultado esperado: 22/10/2026

\- Resultado atual: 17/10/2026



Requisitos relacionados: CA27 e RN02.



\### Defeito 2 — Empréstimo com vencimento na data da operação é rejeitado indevidamente



Localização: `src/loans/loan.service.js`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A condição utiliza `<=`, rejeitando empréstimos cuja data prevista é igual à data da operação. Entretanto, RN07 determina que um empréstimo está atrasado somente quando a data prevista é anterior à data da operação.



Comportamento esperado: Permitir a renovação quando `loan.dueDate === operationDate`, desde que os demais critérios sejam atendidos.



Comportamento atual: Empréstimos que vencem no próprio dia da operação são considerados atrasados e têm sua renovação rejeitada.



Correção sugerida:



```

if (loan.dueDate < operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Requisitos relacionados: CA30 e RN07.



\### Defeito 3 — Renovação rejeitada pode modificar a data prevista do empréstimo



Localização: `src/loans/loan.service.js`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista é modificada antes da verificação do limite de renovações.



Se o empréstimo já tiver três renovações, o método lança uma exceção, mas o objeto `loan` já teve sua data prevista alterada.



Comportamento esperado: Ao tentar realizar uma quarta renovação, a operação deve ser rejeitada sem modificar a data prevista nem o contador de renovações.



Comportamento atual: A quarta renovação é rejeitada, mas `loan.dueDate` já foi alterado em memória. Caso o repositório mantenha referências compartilhadas aos objetos, essa alteração pode permanecer no estado do sistema mesmo sem chamar `persistLoan`.



Correção sugerida: Verificar o limite antes de modificar qualquer atributo do empréstimo.



```

if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}



loan.dueDate = formatDate(addDays(parseDate(loan.dueDate), 7));

loan.renewalCount += 1;

```



Requisitos relacionados: CA31, CA32, RN03 e RN08.



\## Resumo dos defeitos



| # | Defeito                                            | Requisitos violados    |

| - | -------------------------------------------------- | ---------------------- |

| 1 | Cálculo da nova data a partir da data da operação  | CA27, RN02             |

| 2 | Rejeição indevida de empréstimos que vencem no dia | CA30, RN07             |

| 3 | Mutação da data antes da validação do limite       | CA31, CA32, RN03, RN08 |



Conclusão: O Pull Request contém 3 defeitos funcionais identificados. Os dois primeiros produzem comportamento incorreto diretamente. O terceiro introduz uma mutação prematura que pode violar a integridade dos dados, dependendo da implementação do repositório.



Não foram identificadas violações adicionais demonstráveis de CA28 (incremento do contador) ou CA29 (quantidade disponível) no trecho fornecido.

