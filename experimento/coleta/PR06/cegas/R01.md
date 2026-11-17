\# Revisão do Pull Request — RF06 Renovar empréstimo



Foram identificados 4 defeitos funcionais nas alterações do Pull Request.



\## Defeito 1 — Renovação calcula a nova data a partir da data da operação



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));

```



Descrição do problema: A nova data prevista é calculada adicionando 7 dias à data da operação (`currentDate`), em vez de adicionar 7 dias à data prevista atual (`loan.dueDate`).



Comportamento esperado: Cada renovação deve acrescentar exatamente 7 dias à data prevista existente.



Comportamento atual: A nova data passa a ser 7 dias após a operação, podendo até antecipar a data prevista original.



Exemplo:



\- Data prevista atual: 20/10/2026

\- Data da renovação: 10/10/2026

\- Resultado esperado: 27/10/2026

\- Resultado atual: 17/10/2026



Requisitos relacionados: CA27 e RN02.



\## Defeito 2 — Empréstimo com vencimento na data da operação é rejeitado



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

if (loan.dueDate <= operationDate) {

&#x20; throw new AppError("OVERDUE\_LOAN", 409);

}

```



Descrição do problema: A condição utiliza `<=`, rejeitando empréstimos cuja data prevista seja igual à data da operação.



Segundo RN07, um empréstimo está atrasado somente quando a data prevista é anterior à data da operação.



Comportamento esperado: Permitir a renovação quando `loan.dueDate === operationDate`, desde que os demais requisitos sejam atendidos.



Comportamento atual: O sistema rejeita a renovação com `OVERDUE\_LOAN`, mesmo quando o empréstimo vence no próprio dia.



Requisitos relacionados: CA30 e RN07.



\## Defeito 3 — Renovação rejeitada pode modificar a data prevista



Localização: `src/loans/loan.service.js` — método `renewLoan`



```

loan.dueDate = formatDate(addDays(currentDate, 7));



if (loan.renewalCount >= 3) {

&#x20; throw new AppError("RENEWAL\_LIMIT\_REACHED", 409);

}

```



Descrição do problema: A data prevista é modificada antes da validação do limite de três renovações.



Caso o contador já esteja em 3, a operação lança uma exceção, mas o objeto `loan` já foi alterado.



Comportamento esperado: Validar o limite de renovações antes de modificar qualquer dado. Uma renovação rejeitada deve preservar a data prevista e o contador.



Comportamento atual: A renovação é rejeitada, mas a data prevista do objeto em memória já foi modificada. Se o repositório mantiver referências compartilhadas para os objetos armazenados, essa alteração poderá afetar o estado persistido mesmo sem chamar `save()`.



Requisitos relacionados: CA31, CA32 e RN08.



\## Defeito 4 — Renovação reduz indevidamente a quantidade disponível do livro



Localização: `src/loans/loan.service.js` — método `renewLoan`, na chamada de `persistLoan`, e método `persistLoan`.



```

const book = await this.bookRepository.findOne({ id: loan.bookId });

return this.persistLoan(loan, book);

```



O método reutilizado executa:



```

book.availableCopies -= 1;

const createdLoan = await this.loanRepository.save(loan);

await this.bookRepository.save(book);

```



Descrição do problema: A renovação reutiliza `persistLoan`, que decrementa a quantidade disponível do livro, comportamento apropriado à criação de um empréstimo, mas incorreto para sua renovação.



Comportamento esperado: A renovação deve atualizar apenas a data prevista e o contador de renovações, sem alterar a quantidade disponível do livro.



Comportamento atual: A cada renovação bem-sucedida, `book.availableCopies` é reduzido em uma unidade, mesmo sem ocorrer um novo empréstimo.



Exemplo:



\- Quantidade disponível antes da renovação: 5

\- Quantidade disponível esperada após a renovação: 5

\- Quantidade disponível atual após a renovação: 4



Requisito relacionado: CA29.



\## Resumo dos defeitos



| # | Defeito                                                    | Requisitos violados |

| - | ---------------------------------------------------------- | ------------------- |

| 1 | Nova data calculada a partir da data da operação           | CA27, RN02          |

| 2 | Empréstimo vencendo no dia é considerado atrasado          | CA30, RN07          |

| 3 | Data modificada antes da rejeição por limite de renovações | CA31, CA32, RN08    |

| 4 | Renovação reduz a quantidade disponível do livro           | CA29                |



Conclusão: O Pull Request apresenta quatro defeitos funcionais, sendo três com comportamento incorreto diretamente demonstrável pelo código e um risco de violação da integridade dos dados (defeito 3), cuja persistência depende da implementação do repositório.



O incremento do contador (`loan.renewalCount += 1`) e a rejeição da quarta renovação estão implementados, mas a ordem das operações precisa ser corrigida para garantir que rejeições não alterem os dados.

