\# Revisão do Pull Request – RF04 (Realizar empréstimo)



Encontrei 6 defeitos funcionais.



\---



\## Defeito 1 – Data prevista calculada com o relógio da máquina



\*\*Localização:\*\* `src/loans/loan.service.js`, `createLoan`, campo `dueDate: formatDate(addDays(new Date(), LOAN\_DAYS))`



\*\*Descrição do problema:\*\* A data prevista é calculada a partir de `new Date()` (horário real da máquina) em vez da data da operação (`currentDate`), que é usada para `loanDate`.



\*\*Comportamento esperado:\*\* `dueDate = loanDate + 14 dias`, ou seja, `addDays(currentDate, LOAN\_DAYS)`.



\*\*Comportamento atual:\*\* `dueDate` depende do dia em que o código roda. Com `currentDate = 2026-03-01`, a data prevista sai como hoje + 14, e `loanDate` e `dueDate` ficam incoerentes entre si.



\*\*Requisito relacionado:\*\* CA15, RN01, RNF01.



\---



\## Defeito 2 – Limite de empréstimos conta o histórico, não apenas os abertos



\*\*Localização:\*\* `src/loans/loan.service.js`, `createLoan`, trecho `const loans = await this.loanRepository.findByUser(userId); if (loans.length >= MAX\_OPEN\_LOANS)`



\*\*Descrição do problema:\*\* O limite é verificado sobre todos os empréstimos do usuário, inclusive os já devolvidos, e não sobre os em aberto (`findOpenByUser`).



\*\*Comportamento esperado:\*\* Rejeitar apenas quando o usuário já tiver 3 empréstimos em aberto (`returnDate === null`).



\*\*Comportamento atual:\*\* Um usuário com 3 empréstimos já devolvidos (e nenhum aberto) é rejeitado com `LOAN\_LIMIT\_REACHED`.



\*\*Requisito relacionado:\*\* CA19, RN04.



\---



\## Defeito 3 – Critério de atraso usa `<=` em vez de `<`



\*\*Localização:\*\* `src/loans/loan.service.js`, `openLoans.some((loan) => loan.dueDate <= operationDate)`



\*\*Descrição do problema:\*\* Um empréstimo é considerado atrasado quando a data prevista é igual à data da operação.



\*\*Comportamento esperado:\*\* Atrasado somente se `dueDate < operationDate` (estritamente anterior).



\*\*Comportamento atual:\*\* Se o usuário tem um empréstimo cujo vencimento é exatamente hoje, o novo empréstimo é rejeitado com `OVERDUE\_LOAN`, embora esse empréstimo ainda não esteja atrasado.



\*\*Requisito relacionado:\*\* CA18, RN06, RN07.



\---



\## Defeito 4 – Verificação de duplicidade considera empréstimos já devolvidos



\*\*Localização:\*\* `src/loans/loan.service.js`, `createLoan`, uso de `findByUserAndBook` (em vez de `findOpenByUserAndBook`, que existe no repositório e não é utilizado)



\*\*Descrição do problema:\*\* A duplicidade é verificada em qualquer empréstimo do par usuário/livro, mesmo os devolvidos.



\*\*Comportamento esperado:\*\* Rejeitar apenas se houver empréstimo \*\*aberto\*\* do mesmo livro para o mesmo usuário.



\*\*Comportamento atual:\*\* Um usuário que já devolveu o livro não pode pegá-lo emprestado novamente (`BOOK\_ALREADY\_BORROWED`).



\*\*Requisito relacionado:\*\* CA20, RN05.



\---



\## Defeito 5 – Mutação do livro antes das validações (rejeição não preserva a quantidade disponível)



\*\*Localização:\*\* `src/loans/loan.service.js`, `book.availableCopies -= 1;` executado antes das verificações de limite, atraso e duplicidade; combinado com `BookRepository.findOne`, que provavelmente retorna a referência do objeto armazenado.



\*\*Descrição do problema:\*\* A quantidade disponível é decrementada no objeto do livro antes de as demais regras serem validadas. Se o repositório devolver a referência do objeto interno (o `save` do livro é chamado depois, o que sugere que ele não é uma cópia), a alteração já afeta o estado do sistema. As exceções lançadas nas validações seguintes ocorrem \*\*fora\*\* de `runInTransaction`, portanto o `restore` nunca é acionado para elas.



\*\*Comportamento esperado:\*\* Rejeições (limite, atraso, duplicidade) não alteram nenhum dado. O decremento deve ocorrer somente após todas as validações, dentro da transação.



\*\*Comportamento atual:\*\* Nas rejeições por `LOAN\_LIMIT\_REACHED`, `OVERDUE\_LOAN` e `BOOK\_ALREADY\_BORROWED`, a quantidade disponível do livro fica reduzida em uma unidade sem que haja empréstimo, podendo chegar a zero e ficar "perdida".



\*\*Requisito relacionado:\*\* CA16, CA21, RN08, RN09.



\*Observação:\* a confirmação definitiva depende de `BookRepository.findOne` não devolver uma cópia, o que não aparece no diff. Mesmo assim, o decremento antes das validações é frágil e viola CA21 sempre que o repositório retornar a referência.



\---



\## Defeito 6 – `snapshot`/`restore` e rollback inconsistentes para o livro (estado compartilhado)



\*\*Localização:\*\* `src/shared/transaction.js` combinado com `loan.service.js` (`persistLoan`)



\*\*Descrição do problema:\*\* O snapshot da transação é tirado em `persistLoan`, \*\*depois\*\* de `book.availableCopies` já ter sido decrementado. Se `save` falhar, o `restore` devolve o estado "já decrementado" do livro.



\*\*Comportamento esperado:\*\* Em caso de falha ao persistir, a quantidade disponível deve voltar ao valor original.



\*\*Comportamento atual:\*\* O rollback restaura um estado que já contém o decremento, então a quantidade disponível permanece reduzida após uma falha.



\*\*Requisito relacionado:\*\* CA21, RN08, RN09.



\*Observação:\* este defeito tem a mesma causa raiz do Defeito 5 (decremento antes da transação). Corrigir o 5 resolve o 6.



\---



\## Resumo



| # | Regra violada | Causa |

|---|---|---|

| 1 | CA15 / RN01 / RNF01 | `new Date()` em vez de `currentDate` |

| 2 | CA19 / RN04 | `findByUser` em vez de `findOpenByUser` |

| 3 | CA18 / RN06 / RN07 | `<=` em vez de `<` |

| 4 | CA20 / RN05 | `findByUserAndBook` em vez de `findOpenByUserAndBook` |

| 5 | CA21 / RN08 | Decremento antes das validações |

| 6 | CA21 / RN08 / RN09 | Snapshot tirado após o decremento |

