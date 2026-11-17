\# Revisão do Pull Request — RF04 Realizar empréstimo



Foram identificados 6 defeitos funcionais nas alterações, relacionados à preservação dos dados em operações rejeitadas, validação de empréstimos, controle de datas e regras de elegibilidade.



\## Defeito 1 — Redução da disponibilidade antes das validações



Localização: `src/loans/loan.service.js`, linha 240.



Descrição do problema: A quantidade disponível do livro é decrementada antes de verificar o limite de empréstimos, a existência de empréstimos atrasados e a duplicidade do livro. Além disso, a alteração ocorre fora da transação, que só é iniciada em `persistLoan()`.



Comportamento esperado: A quantidade disponível deve ser reduzida somente quando todas as validações forem satisfeitas e o empréstimo puder ser concluído. Qualquer rejeição deve preservar os dados.



Comportamento atual: Quando uma das validações posteriores falha, a operação é rejeitada, mas o objeto `book` já teve `availableCopies` reduzido. Não há rollback dessa alteração.



Requisitos relacionados: CA21, RN08, CA16.



\## Defeito 2 — Contagem de empréstimos encerrados no limite de três



Localização: `src/loans/loan.service.js`, linhas 242–245.



Descrição do problema: O limite de três empréstimos é verificado utilizando `findByUser()`, que retorna todos os empréstimos do usuário, inclusive aqueles já devolvidos.



Comportamento esperado: Somente empréstimos em aberto (`returnDate === null`) devem ser contabilizados. Um usuário com menos de três empréstimos abertos deve poder realizar outro empréstimo, desde que atenda às demais condições.



Comportamento atual: Um usuário que possui três empréstimos históricos, mesmo todos devolvidos, recebe `LOAN\_LIMIT\_REACHED` ao tentar realizar um novo empréstimo.



Requisitos relacionados: CA19, RN04.



\## Defeito 3 — Empréstimo com vencimento na data atual considerado atrasado



Localização: `src/loans/loan.service.js`, linha 249.



Descrição do problema: A verificação de atraso utiliza `loan.dueDate <= operationDate`, classificando como atrasado um empréstimo cuja data prevista é igual à data da operação.



Comportamento esperado: Um empréstimo somente está atrasado quando sua data prevista é estritamente anterior à data da operação (`dueDate < operationDate`).



Comportamento atual: O usuário é impedido de realizar um novo empréstimo quando possui um empréstimo que vence no próprio dia da operação.



Requisitos relacionados: CA18, RN06, RN07.



\## Defeito 4 — Bloqueio de novo empréstimo após devolução do mesmo livro



Localização: `src/loans/loan.service.js`, linhas 253–258.



Descrição do problema: A validação de duplicidade utiliza `findByUserAndBook()`, que retorna empréstimos independentemente de estarem abertos ou encerrados.



Comportamento esperado: O sistema deve rejeitar o empréstimo do mesmo livro apenas quando o usuário já possuir um empréstimo aberto para ele. A verificação deveria considerar `findOpenByUserAndBook()`.



Comportamento atual: Mesmo depois de devolver um livro, o usuário é impedido de emprestá-lo novamente, recebendo `BOOK\_ALREADY\_BORROWED`.



Requisitos relacionados: CA20, RN05.



\## Defeito 5 — Data prevista calculada a partir do relógio da máquina



Localização: `src/loans/loan.service.js`, linha 265.



Descrição do problema: A data prevista é calculada utilizando `addDays(new Date(), LOAN\_DAYS)`, em vez da data da operação previamente obtida em `currentDate`.



Comportamento esperado: A data prevista deve ser a data do empréstimo acrescida de 14 dias corridos. Por exemplo, para um empréstimo realizado em `2026-10-01`, a data prevista deve ser `2026-10-15`.



Comportamento atual: A data prevista depende do horário real da máquina. Assim, uma operação com `currentDate = "2026-10-01"` pode registrar uma data prevista diferente de `2026-10-15`.



Requisitos relacionados: CA15, RN01, RNF01.



\## Defeito 6 — Ausência de relógio controlável para determinar a data da operação



Localização: `src/loans/loan.service.js`, linhas 217–224 e 265; `src/app.js`, linha 62.



Descrição do problema: O serviço recebe `currentDate` diretamente do corpo da requisição e também consulta `new Date()` para calcular o vencimento, sem utilizar um relógio injetável ou controlável. A composição em `createApp()` também não fornece essa dependência.



Comportamento esperado: As datas utilizadas pela operação devem ser obtidas de uma fonte temporal controlável nos testes, sem dependência direta do relógio da máquina, garantindo consistência entre a data do empréstimo, a verificação de atrasos e o vencimento.



Comportamento atual: O cliente determina a data usada para verificar atrasos, enquanto o vencimento é calculado pelo relógio da máquina. Um usuário com empréstimo efetivamente atrasado pode informar uma data anterior à data prevista e contornar a restrição, além de produzir datas inconsistentes.



Requisitos relacionados: RNF01, CA18, RN06, RN07.



\## Resumo dos defeitos



| Nº | Defeito                                                        | Requisitos principais |

| -- | -------------------------------------------------------------- | --------------------- |

| 1  | Alteração da disponibilidade em operação rejeitada             | CA21, RN08            |

| 2  | Empréstimos devolvidos contabilizados no limite                | CA19, RN04            |

| 3  | Vencimento no dia considerado atraso                           | RN07, CA18            |

| 4  | Histórico de empréstimos impede novo empréstimo do mesmo livro | CA20, RN05            |

| 5  | Prazo calculado a partir de `new Date()`                       | CA15, RN01            |

| 6  | Fonte temporal não controlável e manipulável pelo cliente      | RNF01, RN06           |



Conclusão: O Pull Request apresenta seis defeitos funcionais identificáveis no diff. Os defeitos 1, 2, 3 e 4 comprometem diretamente a aplicação das regras de negócio, enquanto os defeitos 5 e 6 comprometem a correção e a consistência temporal dos empréstimos. Os defeitos 5 e 6 são relacionados, mas distintos: um trata do cálculo do vencimento e o outro da origem da data utilizada pela operação.

