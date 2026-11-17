\# Revisão do Pull Request — RF04 Realizar Empréstimo



Foram identificados 5 defeitos funcionais nas alterações, relacionados à contagem de empréstimos, verificação de atrasos, duplicidade de livros, cálculo da data prevista e preservação dos dados em operações rejeitadas.



\## Defeito 1 — Quantidade disponível alterada antes das validações



Localização: `src/loans/loan.service.js`, linha 240 (com impacto nas linhas 242–259).



Descrição do problema: A quantidade disponível do livro é decrementada antes da validação de limite de empréstimos, atrasos e duplicidade. Como a alteração ocorre antes da chamada a `runInTransaction`, as rejeições posteriores não acionam nenhum mecanismo de reversão.



Comportamento esperado: Todas as validações devem ocorrer antes da redução da quantidade disponível. Qualquer operação rejeitada deve preservar integralmente os dados.



Comportamento atual: Um empréstimo rejeitado por limite, atraso ou duplicidade reduz `availableCopies` em uma unidade no objeto do livro obtido do repositório. Se esse objeto compartilhar referência com o registro armazenado, a redução persiste mesmo sem a criação do empréstimo.



Requisitos relacionados: CA21, RN08, RN09.



\## Defeito 2 — Limite de empréstimos considera empréstimos já devolvidos



Localização: `src/loans/loan.service.js`, linhas 242–245.



Descrição do problema: A validação utiliza `findByUser(userId)`, que retorna todos os empréstimos do usuário, incluindo os já devolvidos.



Comportamento esperado: O limite de três empréstimos deve considerar exclusivamente aqueles em aberto (`returnDate === null`).



Comportamento atual: Um usuário que realizou três empréstimos e já devolveu todos fica impedido de realizar novos empréstimos, pois o sistema contabiliza os registros históricos.



Requisitos relacionados: CA19, RN04.



\## Defeito 3 — Empréstimo com vencimento na data atual é considerado atrasado



Localização: `src/loans/loan.service.js`, linha 249.



Descrição do problema: A condição `loan.dueDate <= operationDate` considera atrasado um empréstimo cuja data prevista é igual à data da operação.



Comportamento esperado: Um empréstimo deve ser considerado atrasado somente quando sua data prevista for anterior à data da operação. A comparação deve utilizar `<`.



Comportamento atual: Um usuário com empréstimo vencendo no próprio dia é indevidamente impedido de realizar outro empréstimo.



Requisitos relacionados: CA18, RN06, RN07.



\## Defeito 4 — Duplicidade considera empréstimos já encerrados



Localização: `src/loans/loan.service.js`, linhas 253–259.



Descrição do problema: A consulta utiliza `findByUserAndBook(userId, bookId)`, que procura qualquer empréstimo correspondente ao usuário e ao livro, independentemente de sua devolução.



Comportamento esperado: A restrição de duplicidade deve considerar apenas empréstimos em aberto, utilizando `findOpenByUserAndBook(userId, bookId)`.



Comportamento atual: Um usuário que devolveu determinado livro não consegue emprestá-lo novamente, pois o histórico é interpretado como duplicidade.



Requisitos relacionados: CA20, RN05.



\## Defeito 5 — Data prevista calculada com base no relógio da máquina



Localização: `src/loans/loan.service.js`, linha 265.



Descrição do problema: A data prevista é calculada por `addDays(new Date(), LOAN\_DAYS)`, ignorando `currentDate`, que já foi validada e utilizada como data do empréstimo.



Comportamento esperado: A data prevista deve ser calculada a partir da data do empréstimo, acrescida de 14 dias corridos, sem depender diretamente do relógio da máquina.



Comportamento atual: Se `currentDate` for `2026-10-01`, a data prevista deveria ser `2026-10-15`. Entretanto, o código calcula 14 dias a partir da data real de execução, podendo produzir um vencimento diferente.



Requisitos relacionados: CA15, RN01, RNF01.



\## Resumo dos defeitos



| Nº | Defeito                                           | Requisitos violados |

| -- | ------------------------------------------------- | ------------------- |

| 1  | Redução de estoque antes das validações           | CA21, RN08, RN09    |

| 2  | Contagem de empréstimos encerrados no limite      | CA19, RN04          |

| 3  | Data de vencimento tratada como atraso            | CA18, RN06, RN07    |

| 4  | Histórico de empréstimos tratado como duplicidade | CA20, RN05          |

| 5  | Data prevista baseada no relógio da máquina       | CA15, RN01, RNF01   |



Conclusão: O Pull Request apresenta cinco defeitos funcionais que precisam ser corrigidos para atender aos requisitos de realização de empréstimos. O defeito 1 merece atenção especial por permitir que uma operação rejeitada altere a disponibilidade dos livros.

