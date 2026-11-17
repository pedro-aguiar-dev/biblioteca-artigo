\# Revisão do Pull Request: renovação de empréstimos



Encontrei \*\*4 defeitos\*\* em `src/loans/loan.service.js`, todos dentro de `renewLoan`.



\---



\## Defeito 1: Nova data prevista calculada a partir da data da operação



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, linha `loan.dueDate = formatDate(addDays(currentDate, 7));`



\- \*\*Descrição:\*\* O acréscimo de 7 dias é aplicado sobre `currentDate` (data da operação) em vez de sobre a data prevista atual do empréstimo (`loan.dueDate`).

\- \*\*Comportamento esperado:\*\* `dueDate` = `dueDate` atual + 7 dias. Ex.: prevista em 20/10, renovação em 10/10 → nova data 27/10.

\- \*\*Comportamento atual:\*\* `dueDate` = data da operação + 7 dias. No mesmo exemplo, a nova data seria 17/10, ou seja, o usuário \*perde\* dias e a data pode até diminuir.

\- \*\*Requisito relacionado:\*\* RF06 / CA27 / RN02.



\---



\## Defeito 2: Data modificada antes da validação do limite de renovações (rejeição altera dados)



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, ordem entre `loan.dueDate = ...` e `if (loan.renewalCount >= 3) throw ...`



\- \*\*Descrição:\*\* `loan.dueDate` é alterado no objeto antes de verificar o limite de renovações. Quando a quarta renovação é rejeitada, o erro é lançado com o objeto já mutado.

\- \*\*Comportamento esperado:\*\* Uma renovação rejeitada não altera data nem contador; todas as validações devem ocorrer antes de qualquer modificação.

\- \*\*Comportamento atual:\*\* O objeto `loan` em memória fica com a data alterada. Se o repositório devolver a mesma referência do objeto armazenado (ex.: repositório em memória), a alteração persiste mesmo com a rejeição. Mesmo que não persista, a mutação antes da validação é um risco funcional direto ao requisito.

\- \*\*Requisito relacionado:\*\* CA32 / RN08.



\---



\## Defeito 3: Empréstimo com vencimento no dia da operação é tratado como atrasado



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, condição `if (loan.dueDate <= operationDate)`



\- \*\*Descrição:\*\* A comparação usa `<=`, rejeitando também quando a data prevista é igual à data da operação.

\- \*\*Comportamento esperado:\*\* Atrasado somente quando a data prevista é \*\*anterior\*\* à data da operação (`dueDate < operationDate`). Um empréstimo que vence hoje ainda pode ser renovado.

\- \*\*Comportamento atual:\*\* Um empréstimo com vencimento no próprio dia da renovação é rejeitado com `OVERDUE\_LOAN`.

\- \*\*Requisito relacionado:\*\* CA30 / RN07.



\---



\## Defeito 4: Quantidade disponível do livro é alterada na renovação



\*\*Localização:\*\* `loan.service.js`, `renewLoan`, linha `return this.persistLoan(loan, book);`



\- \*\*Descrição:\*\* `renewLoan` reutiliza `persistLoan`, que executa `book.availableCopies -= 1` e salva o livro. Essa função foi feita para a criação de um empréstimo.

\- \*\*Comportamento esperado:\*\* A renovação apenas salva o empréstimo; `availableCopies` permanece inalterada.

\- \*\*Comportamento atual:\*\* Cada renovação bem-sucedida diminui em 1 a quantidade disponível do livro, o que pode chegar a valores incorretos ou negativos.

\- \*\*Requisito relacionado:\*\* CA29.



\---



\## Observações



\- O contador (`renewalCount += 1`, CA28) e o limite (`>= 3`, CA31/RN03) estão corretos em si; o problema do limite é apenas a ordem em relação à mutação da data (Defeito 2).

\- Recomenda-se, na correção, reunir todas as validações (existência, devolvido, atraso, limite) antes de qualquer alteração em `loan`, e salvar somente o empréstimo na renovação, sem tocar no livro.

