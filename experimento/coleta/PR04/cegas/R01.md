\## Revisão do Pull Request — RF04 Realizar empréstimo



Foram identificados 6 defeitos funcionais nas alterações do Pull Request.



\### Defeito 1 — Quantidade disponível alterada em operações rejeitadas



Localização: `src/loans/loan.service.js`, linhas 240–259.



Descrição do problema: O código decrementa `book.availableCopies` antes de verificar as restrições do usuário. Caso alguma validação posterior rejeite o empréstimo, a quantidade já terá sido alterada. A transação só é iniciada em `persistLoan`, depois dessas validações, e não protege essa alteração.



Comportamento esperado: Qualquer empréstimo rejeitado deve preservar a quantidade disponível e os demais dados do sistema.



Comportamento atual: Em rejeições por limite de empréstimos, atraso ou livro duplicado, a quantidade disponível é reduzida indevidamente no objeto retornado pelo repositório, podendo afetar seu estado interno.



Requisitos relacionados: CA21, RN08, RN09.



\### Defeito 2 — Limite de três empréstimos considera empréstimos devolvidos



Localização: `src/loans/loan.service.js`, linhas 242–245.



Descrição do problema: A validação utiliza `findByUser(userId)`, que retorna todos os empréstimos do usuário, incluindo os já devolvidos.



Comportamento esperado: O limite de três deve considerar somente os empréstimos em aberto (`returnDate === null`).



Comportamento atual: Um usuário com três empréstimos já devolvidos e nenhum em aberto é impedido de realizar um novo empréstimo.



Requisitos relacionados: CA19, RN04.



\### Defeito 3 — Empréstimo com vencimento na data atual é considerado atrasado



Localização: `src/loans/loan.service.js`, linha 249.



Descrição do problema: A condição `loan.dueDate <= operationDate` considera atrasado um empréstimo cuja data prevista é igual à data da operação.



Comportamento esperado: Um empréstimo só deve ser considerado atrasado quando `dueDate < operationDate`.



Comportamento atual: Um usuário com empréstimo que vence no próprio dia é impedido de realizar outro empréstimo, mesmo não estando atrasado.



Requisitos relacionados: CA18, RN06, RN07.



\### Defeito 4 — Validação de livro duplicado considera empréstimos devolvidos



Localização: `src/loans/loan.service.js`, linhas 253–259.



Descrição do problema: A consulta `findByUserAndBook` retorna qualquer empréstimo anterior do usuário para o livro, independentemente de sua data de devolução.



Comportamento esperado: A restrição deve considerar apenas empréstimos em aberto, utilizando `findOpenByUserAndBook`.



Comportamento atual: Um usuário que já emprestou e devolveu determinado livro não consegue emprestá-lo novamente.



Requisitos relacionados: CA20, RN05.



\### Defeito 5 — Data prevista calculada a partir do relógio da máquina



Localização: `src/loans/loan.service.js`, linha 265.



Descrição do problema: A data prevista é calculada com `addDays(new Date(), LOAN\_DAYS)`, utilizando diretamente o horário da máquina em vez da data do empréstimo.



Comportamento esperado: A data prevista deve ser calculada somando 14 dias corridos à data do empréstimo, proveniente de uma fonte de tempo controlável nos testes.



Comportamento atual: Se `currentDate` for `2026-10-01` e o servidor estiver em `2026-10-09`, o empréstimo será registrado em 1º de outubro, mas sua data prevista será 23 de outubro, em vez de 15 de outubro.



Requisitos relacionados: CA15, RN01, RNF01.



\### Defeito 6 — Data da operação depende de valor fornecido pelo cliente



Localização: `src/loans/loan.service.js`, linhas 217–224 e 247–249.



Descrição do problema: O serviço exige `currentDate` na requisição e utiliza essa data para registrar o empréstimo e verificar atrasos, sem obter a data da operação de um relógio controlável e confiável.



Comportamento esperado: A data da operação deve ser obtida por uma abstração de relógio injetável, permitindo testes determinísticos e impedindo que o cliente manipule as regras temporais.



Comportamento atual: Um cliente pode informar uma data anterior à data real para contornar a validação de empréstimos atrasados. Além disso, requisições sem `currentDate` são rejeitadas, mesmo que usuário e livro sejam válidos.



Requisitos relacionados: CA18, RN06, RN07, RNF01.



\## Resumo dos defeitos



| Nº | Defeito                                   | Requisitos              |

| -- | ----------------------------------------- | ----------------------- |

| 1  | Alteração de estoque antes das validações | CA21, RN08, RN09        |

| 2  | Limite considera empréstimos devolvidos   | CA19, RN04              |

| 3  | Vencimento no dia considerado atraso      | CA18, RN06, RN07        |

| 4  | Livro devolvido impede novo empréstimo    | CA20, RN05              |

| 5  | Data prevista calculada com `new Date()`  | CA15, RN01, RNF01       |

| 6  | Data da operação controlada pelo cliente  | CA18, RN06, RN07, RNF01 |



Conclusão: O Pull Request apresenta seis defeitos funcionais relacionados à integridade dos dados, às regras de elegibilidade para empréstimos e ao controle de datas. Todos podem provocar comportamento incorreto ou violar diretamente os requisitos especificados.

