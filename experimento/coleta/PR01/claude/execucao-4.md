Encontrei 4 defeitos funcionais.



\---



\*\*Defeito 1 — Validação executada após a persistência\*\*



\- \*\*Localização:\*\* `src/books/book.service.js`, `createBook` (chamada a `bookRepository.save` antes dos blocos `if (isBlank(...))` e `if (!totalCopies)`)

\- \*\*Problema:\*\* o livro é salvo no repositório antes de qualquer validação de campos. Quando a validação falha, o erro é lançado, mas o registro inválido já foi inserido no acervo e não há rollback.

\- \*\*Comportamento esperado:\*\* um cadastro inválido é rejeitado e o acervo permanece inalterado.

\- \*\*Comportamento atual:\*\* POST `/books` com título vazio retorna erro, mas o livro inválido aparece no GET `/books`.

\- \*\*Requisito relacionado:\*\* CA05, RN08.



\---



\*\*Defeito 2 — Verificação de unicidade do ISBN usa também o título\*\*



\- \*\*Localização:\*\* `src/books/book.service.js`, `await this.bookRepository.findOne({ isbn, title })`

\- \*\*Problema:\*\* o critério de busca combina `isbn` e `title`, então a duplicidade só é detectada quando ambos coincidem. Dois livros com o mesmo ISBN e títulos diferentes passam na checagem.

\- \*\*Comportamento esperado:\*\* o cadastro é rejeitado sempre que o ISBN já existir no acervo, independentemente dos demais campos.

\- \*\*Comportamento atual:\*\* cadastrar `{isbn: "123", title: "A"}` e depois `{isbn: "123", title: "B"}` cria dois livros com o mesmo ISBN.

\- \*\*Requisito relacionado:\*\* CA02.



\---



\*\*Defeito 3 — `availableCopies` aceito da entrada do cliente\*\*



\- \*\*Localização:\*\* `src/books/book.service.js`, `availableCopies: input.availableCopies ?? totalCopies`

\- \*\*Problema:\*\* a quantidade disponível é derivada do corpo da requisição quando informada, em vez de ser sempre igual à quantidade total. Isso também permite valores negativos ou maiores que `totalCopies`.

\- \*\*Comportamento esperado:\*\* no cadastro, a quantidade disponível é sempre igual à quantidade total.

\- \*\*Comportamento atual:\*\* POST com `{totalCopies: 5, availableCopies: 50}` (ou `-3`) armazena o valor enviado pelo cliente.

\- \*\*Requisito relacionado:\*\* CA01, RN09.



\---



\*\*Defeito 4 — Validação de quantidade total por valor falsy\*\*



\- \*\*Localização:\*\* `src/books/book.service.js`, `if (!totalCopies)`

\- \*\*Problema:\*\* a checagem só rejeita valores falsy (`0`, `undefined`, `null`, `""`). Números negativos e valores não numéricos (como a string `"3"`) são aceitos.

\- \*\*Comportamento esperado:\*\* rejeitar o cadastro quando a quantidade total não for um número inteiro maior que zero.

\- \*\*Comportamento atual:\*\* `{totalCopies: -2}` é cadastrado com sucesso, e `availableCopies` fica negativo.

\- \*\*Requisito relacionado:\*\* CA04, RN09.



\---



Os defeitos 1 e 3 se reforçam: como a persistência ocorre antes da validação, qualquer valor inválido de `availableCopies` chega ao acervo mesmo nos fluxos que retornam erro.

