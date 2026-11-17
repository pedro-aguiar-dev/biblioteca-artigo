\## Defeitos encontrados



\### 1. Validação executada após a persistência



\*\*Localização:\*\* `src/books/book.service.js`, método `createBook` — bloco de validação (`isBlank(...)` e `!totalCopies`) posicionado depois da chamada `this.bookRepository.save(...)`.



\*\*Problema:\*\* o livro é gravado no repositório antes de qualquer verificação de validade. Quando a validação falha, o erro é lançado, mas o registro já foi inserido (e já consumiu um id do `#nextId`).



\*\*Comportamento esperado:\*\* uma requisição inválida é rejeitada e o acervo permanece inalterado.



\*\*Comportamento atual:\*\* POST `/books` com título vazio retorna erro 4xx, mas o livro inválido passa a constar em GET `/books`.



\*\*Requisito relacionado:\*\* CA05, RN08.



\---



\### 2. Verificação de unicidade do ISBN usa ISBN + título



\*\*Localização:\*\* `src/books/book.service.js` — `findOne({ isbn, title })`.



\*\*Problema:\*\* o critério combina dois campos com AND. A duplicidade só é detectada quando ISBN \*e\* título coincidem.



\*\*Comportamento esperado:\*\* qualquer cadastro com ISBN já existente é rejeitado com 409, independentemente dos demais campos.



\*\*Comportamento atual:\*\* cadastrar `{isbn: "123", title: "A"}` e depois `{isbn: "123", title: "B"}` resulta em dois livros com o mesmo ISBN.



\*\*Requisito relacionado:\*\* CA02.



\---



\### 3. `availableCopies` aceito a partir da entrada



\*\*Localização:\*\* `src/books/book.service.js` — `availableCopies: input.availableCopies ?? totalCopies`.



\*\*Problema:\*\* a quantidade disponível é controlada pelo cliente em vez de ser derivada da quantidade total. Não há validação de faixa.



\*\*Comportamento esperado:\*\* no cadastro, `availableCopies` deve ser sempre igual a `totalCopies`.



\*\*Comportamento atual:\*\* `{totalCopies: 5, availableCopies: 99}` ou `{totalCopies: 5, availableCopies: -3}` são aceitos e armazenados, deixando o acervo com disponibilidade fora do intervalo \[0, totalCopies].



\*\*Requisito relacionado:\*\* CA01, RN09.



\---



\### 4. Validação de `totalCopies` insuficiente



\*\*Localização:\*\* `src/books/book.service.js` — `if (!totalCopies) throw new AppError("INVALID\_QUANTITY")`.



\*\*Problema:\*\* o teste de falsidade só barra `0`, `undefined`, `null`, `NaN` e string vazia. Valores negativos, não numéricos e fracionários passam.



\*\*Comportamento esperado:\*\* rejeitar o cadastro quando `totalCopies` não for um inteiro maior que zero.



\*\*Comportamento atual:\*\* `totalCopies: -4` ou `totalCopies: "dez"` são aceitos e gravados; no caso negativo, `availableCopies` também fica negativo.



\*\*Requisito relacionado:\*\* CA04, RN09.



\---



\### 5. Consulta de duplicidade antes da validação de entrada



\*\*Localização:\*\* `src/books/book.service.js` — `findOne` chamado como primeira operação.



\*\*Problema:\*\* com `isbn` ausente, a busca é feita com `isbn: undefined`. Como já existem registros inválidos gravados pelo defeito 1 (que podem ter `isbn` `undefined`), a comparação `book.isbn === undefined` passa a casar, e cadastros subsequentes sem ISBN retornam 409 `ISBN\_ALREADY\_EXISTS` em vez do erro de validação correto.



\*\*Comportamento esperado:\*\* ausência de ISBN é rejeitada como cadastro inválido.



\*\*Comportamento atual:\*\* o segundo cadastro sem ISBN é tratado como conflito de ISBN duplicado.



\*\*Requisito relacionado:\*\* CA02, CA05.



\---



\### Observação adicional



Em `src/books/book.routes.js`, os handlers são `async` e não possuem `try/catch` nem `next(err)`. Isso só funciona se o projeto usar Express 5 (ou um wrapper como `express-async-errors`); em Express 4 as rejeições não chegam ao `handleError` e a requisição fica pendente até o timeout. Vale confirmar a versão no `package.json`.

