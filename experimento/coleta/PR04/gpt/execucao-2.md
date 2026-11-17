\## Revisão do Pull Request — RF04 Realizar empréstimo



Foram identificados 6 defeitos funcionais na implementação. Os problemas afetam a preservação dos dados em operações rejeitadas, a validação dos empréstimos em aberto, a identificação de atrasos e o cálculo da data prevista.



\### Defeito 1 — Alteração da quantidade disponível antes das validações



Localização: `src/loans/loan.service.js`, linha 240 (relacionada às linhas 242–259).



Descrição do problema: A quantidade disponível do livro é decrementada antes das validações de limite de empréstimos, atraso e duplicidade. Como essas validações ocorrem fora de `runInTransaction`, uma rejeição não desfaz a alteração no objeto `book`.



Comportamento esperado: Quando um empréstimo for rejeitado, a quantidade disponível deve permanecer inalterada, assim como os demais dados do sistema.



Comportamento atual: Uma tentativa rejeitada pode reduzir a quantidade disponível do livro em uma unidade, mesmo sem criar um empréstimo.



Requisitos relacionados: CA21, RN08 e RN09.



\### Defeito 2 — Limite de empréstimos considera também os devolvidos



Localização: `src/loans/loan.service.js`, linhas 242–244.



Descrição do problema: A validação utiliza `findByUser(userId)`, que retorna todos os empréstimos do usuário, inclusive os já devolvidos, em vez de considerar apenas empréstimos em aberto.



Comportamento esperado: Rejeitar a operação somente quando o usuário já possuir três empréstimos em aberto.



Comportamento atual: Um usuário com três empréstimos históricos já devolvidos e nenhum empréstimo em aberto é impedido de realizar um novo empréstimo.



Requisitos relacionados: CA19 e RN04.



\### Defeito 3 — Empréstimo com vencimento na data atual é considerado atrasado



Localização: `src/loans/loan.service.js`, linha 249.



Descrição do problema: A condição utiliza `loan.dueDate <= operationDate`, classificando como atrasado também um empréstimo cuja data prevista é igual à data da operação.



Comportamento esperado: Um empréstimo deve ser considerado atrasado somente quando sua data prevista for anterior à data da operação.



Comportamento atual: O sistema rejeita um novo empréstimo quando o usuário possui um empréstimo que vence no próprio dia, mesmo que ainda não esteja atrasado.



Requisitos relacionados: CA18, RN06 e RN07.



\### Defeito 4 — Validação de duplicidade considera empréstimos já devolvidos



Localização: `src/loans/loan.service.js`, linhas 253–258.



Descrição do problema: O método `findByUserAndBook` procura qualquer empréstimo anterior do mesmo livro para o usuário, independentemente da data de devolução. O repositório já disponibiliza `findOpenByUserAndBook`, mas ele não é utilizado.



Comportamento esperado: Rejeitar o empréstimo do mesmo livro somente quando o usuário já possuir um empréstimo em aberto para ele.



Comportamento atual: Um usuário que já emprestou e devolveu determinado livro fica impedido de emprestá-lo novamente.



Requisitos relacionados: CA20 e RN05.



\### Defeito 5 — Data prevista calculada a partir do relógio da máquina



Localização: `src/loans/loan.service.js`, linha 265.



Descrição do problema: A data prevista é calculada com `addDays(new Date(), LOAN\_DAYS)`, utilizando a data atual da máquina em vez da data do empréstimo (`currentDate`), já validada e armazenada em `loanDate`.



Comportamento esperado: A data prevista deve corresponder à data do empréstimo acrescida de 14 dias corridos.



Comportamento atual: Quando a data informada na operação difere da data da máquina, a data prevista é calculada incorretamente. Por exemplo, para um empréstimo registrado em `2026-09-01`, a data prevista deveria ser `2026-09-15`, independentemente da data de execução.



Requisitos relacionados: CA15, RN01 e RNF01.



\### Defeito 6 — Ausência de relógio controlável para a data da operação



Localização: `src/loans/loan.service.js`, linhas 207–211 e 217–220; `src/app.js`, linha 62.



Descrição do problema: A implementação não recebe um relógio controlável por injeção de dependência. A data da operação é fornecida diretamente pelo cliente por meio de `input.currentDate`, enquanto o cálculo do vencimento utiliza `new Date()`. Dessa forma, não existe uma fonte de tempo controlável e consistente para a operação.



Comportamento esperado: O serviço deve obter a data da operação de um relógio controlável nos testes, utilizando essa referência temporal de maneira consistente, sem depender diretamente do relógio da máquina.



Comportamento atual: A data da operação depende de um valor enviado pelo cliente, e o vencimento depende do horário real da máquina. Isso permite que o cliente informe uma data arbitrária para influenciar a verificação de atrasos.



Requisitos relacionados: RNF01, RN06 e RN07.



\## Resumo dos defeitos



| Nº | Defeito                                           | Requisitos afetados |

| -- | ------------------------------------------------- | ------------------- |

| 1  | Redução da disponibilidade antes das validações   | CA21, RN08, RN09    |

| 2  | Contagem de empréstimos devolvidos no limite      | CA19, RN04          |

| 3  | Consideração de vencimento no dia como atraso     | CA18, RN06, RN07    |

| 4  | Bloqueio de novo empréstimo de livro já devolvido | CA20, RN05          |

| 5  | Cálculo do vencimento usando a data da máquina    | CA15, RN01, RNF01   |

| 6  | Ausência de relógio controlável para a operação   | RNF01, RN06, RN07   |



Conclusão: O Pull Request não atende integralmente aos critérios de aceitação de RF04. Os defeitos 1, 2, 3 e 4 produzem rejeições indevidas ou alterações de dados em operações rejeitadas. Os defeitos 5 e 6 comprometem o cálculo do prazo e o controle das datas exigido pelas regras de negócio.

