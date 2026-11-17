Encontrei \*\*4 defeitos funcionais\*\* no Pull Request.



\### 1. Validação ocorre depois da persistência

\- \*\*Localização:\*\* `src/books/book.service.js`, método `createBook`, chamada a `bookRepository.save(...)` antes das validações.

\- \*\*Descrição do problema:\*\* o livro é salvo no repositório antes de validar ISBN, título, autor e quantidade total. Se a entrada for inválida, uma exceção é lançada, mas o registro já foi incluído no acervo.

\- \*\*Comportamento esperado:\*\* validar completamente os dados antes de qualquer alteração no repositório. Um cadastro inválido deve ser rejeitado sem modificar o acervo.

\- \*\*Comportamento atual:\*\* entradas inválidas podem ser persistidas e, em seguida, a API retorna erro. Além disso, o `#nextId` também é incrementado.

\- \*\*Requisito relacionado:\*\* \*\*CA05\*\* e \*\*RN08\*\*.



\---



\### 2. ISBN duplicado é permitido quando o título é diferente

\- \*\*Localização:\*\* `src/books/book.service.js`

&#x20; ```js

&#x20; const existingBook = await this.bookRepository.findOne({ isbn, title });

&#x20; ```

\- \*\*Descrição do problema:\*\* a busca por duplicidade exige que \*\*ISBN e título\*\* coincidam simultaneamente. Assim, um livro com ISBN já cadastrado pode ser inserido caso tenha outro título.

\- \*\*Comportamento esperado:\*\* a existência de qualquer livro com o mesmo ISBN deve impedir o cadastro, independentemente do título.

\- \*\*Comportamento atual:\*\* apenas a combinação duplicada de `isbn + title` é rejeitada.

\- \*\*Requisito relacionado:\*\* \*\*CA02 — ISBN deve ser obrigatório e único\*\*.



\---



\### 3. Quantidade total negativa é aceita

\- \*\*Localização:\*\* `src/books/book.service.js`

&#x20; ```js

&#x20; if (!totalCopies) {

&#x20;   throw new AppError("INVALID\_QUANTITY");

&#x20; }

&#x20; ```

\- \*\*Descrição do problema:\*\* a condição verifica apenas se `totalCopies` é um valor falsy. Valores negativos, como `-1`, são truthy em JavaScript e passam pela validação.

\- \*\*Comportamento esperado:\*\* aceitar somente quantidade total \*\*maior que zero\*\*.

\- \*\*Comportamento atual:\*\* valores negativos podem ser cadastrados.

\- \*\*Requisito relacionado:\*\* \*\*CA04\*\*. Também pode levar à violação de \*\*RN09\*\*.



\---



\### 4. Cliente pode definir `availableCopies` diferente da quantidade total

\- \*\*Localização:\*\* `src/books/book.service.js`

&#x20; ```js

&#x20; availableCopies: input.availableCopies ?? totalCopies,

&#x20; ```

\- \*\*Descrição do problema:\*\* durante o cadastro, o valor enviado pelo cliente em `availableCopies` é utilizado. Isso permite criar, por exemplo, um livro com `totalCopies: 5` e `availableCopies: 2`, `10` ou `-1`.

\- \*\*Comportamento esperado:\*\* todo livro recém-cadastrado deve iniciar obrigatoriamente com:

&#x20; ```text

&#x20; quantidade disponível = quantidade total

&#x20; ```

&#x20; e a quantidade disponível deve permanecer no intervalo entre zero e a quantidade total.

\- \*\*Comportamento atual:\*\* `availableCopies` pode ser arbitrariamente informado pelo cliente, inclusive fora do intervalo permitido.

\- \*\*Requisito relacionado:\*\* \*\*CA01\*\* e \*\*RN09\*\*.

