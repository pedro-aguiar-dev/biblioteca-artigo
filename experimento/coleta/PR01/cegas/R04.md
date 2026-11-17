\## Revisão de Código — Cadastro de Livros (RF01)



Foram identificados 4 defeitos funcionais.



\---



\### Defeito 1 — Validações executadas após a persistência



\*\*Localização:\*\* `src/books/book.service.js`, método `createBook` (chamada de `save` antes dos blocos `if (isBlank(...))` e `if (!totalCopies)`).



\*\*Descrição:\*\* O livro é gravado no repositório antes de qualquer validação de campos obrigatórios e de quantidade. Quando a validação falha, a exceção é lançada, mas o registro inválido já foi inserido no acervo e permanece lá.



\*\*Comportamento esperado:\*\* Validar `isbn`, `title`, `author` e `totalCopies` antes de persistir; em caso de falha, rejeitar a requisição sem gravar nada.



\*\*Comportamento atual:\*\* Um POST com dados inválidos (ex.: `{ "isbn": "", "title": "", "author": "", "totalCopies": 0 }`) retorna erro, mas o livro inválido aparece no `GET /books`.



\*\*Requisito relacionado:\*\* CA05, RN08.



\---



\### Defeito 2 — Verificação de unicidade usa ISBN + título



\*\*Localização:\*\* `src/books/book.service.js` — `findOne({ isbn, title })`.



\*\*Descrição:\*\* O critério de busca exige que ISBN \*\*e\*\* título coincidam. A unicidade passa a ser da combinação, não do ISBN isolado.



\*\*Comportamento esperado:\*\* Rejeitar o cadastro sempre que já existir um livro com o mesmo ISBN, independentemente do título.



\*\*Comportamento atual:\*\* Cadastrar `{ isbn: "978-1", title: "A" }` e depois `{ isbn: "978-1", title: "B" }` é aceito, resultando em dois livros com o mesmo ISBN no acervo.



\*\*Requisito relacionado:\*\* CA02.



\---



\### Defeito 3 — `availableCopies` aceito a partir da entrada do cliente



\*\*Localização:\*\* `src/books/book.service.js` — `availableCopies: input.availableCopies ?? totalCopies`.



\*\*Descrição:\*\* O campo é desestruturado apenas parcialmente e a quantidade disponível pode ser informada pelo cliente, sobrescrevendo a regra de inicialização. Não há nenhuma verificação de faixa sobre o valor recebido.



\*\*Comportamento esperado:\*\* No cadastro, `availableCopies` deve ser sempre igual a `totalCopies`, ignorando qualquer valor vindo da requisição.



\*\*Comportamento atual:\*\* `{ totalCopies: 5, availableCopies: 99 }` cria um livro com 99 disponíveis de 5 totais; `availableCopies: -3` cria um livro com quantidade negativa.



\*\*Requisito relacionado:\*\* CA01, RN09.



\---



\### Defeito 4 — Validação de quantidade por valor falsy



\*\*Localização:\*\* `src/books/book.service.js` — `if (!totalCopies) throw new AppError("INVALID\\\_QUANTITY")`.



\*\*Descrição:\*\* A checagem rejeita apenas valores falsy (`0`, `undefined`, `null`, `""`). Valores numéricos negativos, não inteiros e strings numéricas passam na validação.



\*\*Comportamento esperado:\*\* Aceitar apenas números inteiros estritamente maiores que zero; rejeitar o restante.



\*\*Comportamento atual:\*\* `totalCopies: -5` é aceito e grava um livro com quantidade total e disponível negativas; `totalCopies: "3"` é aceito e armazena uma string onde se espera número, quebrando comparações e operações aritméticas posteriores (empréstimo/devolução).



\*\*Requisito relacionado:\*\* CA04, RN09.



\---



\### Observação sobre a correção



Os defeitos 1 a 4 se concentram no mesmo método. A ordem correta seria: validar entrada → verificar unicidade apenas por `isbn` → persistir com `availableCopies` derivado de `totalCopies`.

