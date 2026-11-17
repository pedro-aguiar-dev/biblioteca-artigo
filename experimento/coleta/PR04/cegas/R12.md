\# Revisão de código — Pull Request RF04



Foram identificados 6 defeitos funcionais na implementação da realização de empréstimos. Os problemas afetam a integridade do estoque, as regras de elegibilidade do usuário, a validação de empréstimos duplicados e o cálculo das datas.



\## Defeito 1 — Redução da quantidade disponível antes das validações



Localização: `src/loans/loan.service.js`, linhas 240–258.



Descrição do problema: A quantidade disponível do livro é reduzida antes da verificação do limite de empréstimos, da existência de empréstimos atrasados e da duplicidade do livro. Caso uma dessas validações rejeite a operação, a quantidade disponível já terá sido alterada, sem que haja um empréstimo criado.



Comportamento esperado: Qualquer operação rejeitada deve preservar a quantidade disponível e os demais dados do sistema.



Comportamento atual: A propriedade `book.availableCopies` é decrementada antes das validações. Como a transação somente é iniciada em `persistLoan()`, as rejeições anteriores não executam rollback.



Requisitos relacionados: CA21, RN08 e RN09.



\## Defeito 2 — Limite de empréstimos considera empréstimos já devolvidos



Localização: `src/loans/loan.service.js`, linhas 242–245.



Descrição do problema: A validação utiliza `findByUser()`, que retorna todos os empréstimos do usuário, independentemente de terem sido devolvidos. Entretanto, o limite de três deve considerar apenas empréstimos em aberto.



Comportamento esperado: Rejeitar um novo empréstimo somente quando o usuário já possuir três empréstimos em aberto.



Comportamento atual: Um usuário com três empréstimos já devolvidos e nenhum empréstimo em aberto é impedido de realizar um novo empréstimo.



Requisitos relacionados: CA19 e RN04.



\## Defeito 3 — Empréstimo com vencimento na data atual é considerado atrasado



Localização: `src/loans/loan.service.js`, linha 249.



Descrição do problema: A verificação utiliza `loan.dueDate <= operationDate`, considerando atrasado também um empréstimo cuja data prevista é igual à data da operação.



Comportamento esperado: Conforme RN07, um empréstimo somente está atrasado quando a data prevista é anterior à data da operação. Portanto, a comparação deve ser estrita (`<`).



Comportamento atual: Um usuário com empréstimo vencendo no próprio dia é impedido de realizar outro empréstimo, mesmo que ainda esteja dentro do prazo.



Requisitos relacionados: CA18, RN06 e RN07.



\## Defeito 4 — Verificação de duplicidade considera empréstimos encerrados



Localização: `src/loans/loan.service.js`, linhas 253–258.



Descrição do problema: A verificação utiliza `findByUserAndBook()`, que retorna um empréstimo independentemente de sua data de devolução. Assim, um empréstimo já encerrado é tratado como duplicidade.



Comportamento esperado: Rejeitar o empréstimo do mesmo livro apenas quando o usuário já possuir um empréstimo em aberto para esse livro.



Comportamento atual: Um usuário que já pegou determinado livro emprestado e o devolveu não consegue realizar outro empréstimo do mesmo livro.



Requisitos relacionados: CA20 e RN05.



\## Defeito 5 — Data prevista calculada a partir do relógio da máquina



Localização: `src/loans/loan.service.js`, linha 265.



Descrição do problema: O cálculo da data prevista utiliza `addDays(new Date(), LOAN\_DAYS)`, em vez de utilizar a data do empréstimo armazenada em `currentDate`.



Além disso, `new Date()` depende diretamente do relógio da máquina, contrariando a exigência de um relógio controlável nos testes.



Comportamento esperado: A data prevista deve corresponder à data do empréstimo acrescida de 14 dias corridos, utilizando uma fonte de tempo controlável.



Comportamento atual: A data prevista é calculada com base na data real de execução do sistema. Caso `currentDate` seja diferente da data da máquina, a data prevista ficará incorreta.



Requisitos relacionados: CA15, RN01 e RNF01.



\## Defeito 6 — Transação não protege integralmente a alteração do estoque



Localização: `src/loans/loan.service.js`, linhas 240 e 273–281; `src/shared/transaction.js`, linhas 319–325.



Descrição do problema: A transação captura os snapshots dos repositórios somente quando `persistLoan()` é executado. Entretanto, o objeto `book` já teve sua propriedade `availableCopies` alterada antes da captura desses snapshots.



Isso significa que o snapshot do repositório de livros pode conter a quantidade já decrementada.



Comportamento esperado: Caso a persistência do empréstimo ou a atualização do livro falhe, todas as modificações realizadas pela operação devem ser revertidas, incluindo a redução da quantidade disponível.



Comportamento atual: Se ocorrer uma falha durante a persistência, o mecanismo de rollback restaura o estado capturado após a redução da quantidade disponível. Dessa forma, a operação pode falhar e ainda assim deixar o estoque reduzido.



Requisitos relacionados: CA21 e RN08.



\## Resumo dos defeitos



| Nº | Defeito                                      | Requisitos violados |

| -- | -------------------------------------------- | ------------------- |

| 1  | Estoque reduzido antes das validações        | CA21, RN08, RN09    |

| 2  | Limite considera empréstimos devolvidos      | CA19, RN04          |

| 3  | Vencimento no dia atual tratado como atraso  | CA18, RN06, RN07    |

| 4  | Duplicidade considera empréstimos encerrados | CA20, RN05          |

| 5  | Data prevista utiliza relógio da máquina     | CA15, RN01, RNF01   |

| 6  | Rollback não restaura corretamente o estoque | CA21, RN08          |



Conclusão: O Pull Request apresenta seis defeitos funcionais identificáveis a partir do código fornecido. Recomenda-se corrigir os problemas antes da aprovação, especialmente os relacionados à integridade do estoque e às validações das regras de negócio.

