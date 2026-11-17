**## Revisão de Código — RF02 / RF07**



**Foram encontrados \*\*4 defeitos funcionais\*\*.**



**---**



**### Defeito 1 — Verificação de e-mail duplicado no cadastro nunca dispara**



**\*\*Localização:\*\* `src/users/user.service.js`, `createUser`**



**```js**

**if (existingUser \&\& existingUser.id === input.id) {**

**```**



**\*\*Problema:\*\* no cadastro, `input.id` é sempre `undefined` (o id é gerado pelo repositório). Como `existingUser.id` é sempre um número, a comparação é sempre falsa e a exceção `EMAIL\_ALREADY\_EXISTS` jamais é lançada. A condição está invertida em relação à intenção: deveria rejeitar quando o e-mail já existe, independentemente de id.**



**\*\*Comportamento esperado:\*\* cadastrar um usuário com e-mail já pertencente a outro usuário deve ser rejeitado (409).**



**\*\*Comportamento atual:\*\* o cadastro é aceito e dois usuários passam a existir com o mesmo e-mail.**



**\*\*Requisito relacionado:\*\* CA07.**



**---**



**### Defeito 2 — Validação executada depois da persistência**



**\*\*Localização:\*\* `src/users/user.service.js`, `createUser`**



**```js**

**const user = await this.userRepository.save({ name, email });**



**if (isBlank(name) \&\& !isValidEmail(email)) {**

&#x20; **throw new AppError("INVALID\_USER");**

**}**

**```**



**\*\*Problema:\*\* o usuário é gravado antes da validação. Quando a validação falha, o erro é lançado, mas o registro já foi inserido no repositório (e o id já foi consumido), ficando visível em `GET /users`.**



**\*\*Comportamento esperado:\*\* uma tentativa inválida deve ser rejeitada sem criar nenhum registro; nenhum dado do sistema pode ser modificado por operação rejeitada.**



**\*\*Comportamento atual:\*\* a requisição retorna erro, mas o usuário inválido permanece armazenado.**



**\*\*Requisito relacionado:\*\* CA09, RN08.**



**---**



**### Defeito 3 — Condição de validação usa `\&\&` em vez de `||`**



**\*\*Localização:\*\* `src/users/user.service.js`, `createUser`**



**```js**

**if (isBlank(name) \&\& !isValidEmail(email)) {**

**```**



**\*\*Problema:\*\* a rejeição só ocorre quando \*\*ambos\*\* os campos são inválidos. Basta um deles estar correto para o cadastro passar. Consequências:**



**- nome vazio + e-mail válido → aceito;**

**- nome válido + e-mail inválido ou ausente (`undefined`) → aceito, criando usuário sem e-mail, o que também quebra a obrigatoriedade do campo.**



**\*\*Comportamento esperado:\*\* rejeitar o cadastro se o nome estiver vazio \*\*ou\*\* o e-mail for inválido/ausente.**



**\*\*Comportamento atual:\*\* só rejeita quando nome e e-mail estão simultaneamente inválidos.**



**\*\*Requisito relacionado:\*\* CA08, CA07 (obrigatoriedade do e-mail), CA06.**



**---**



**### Defeito 4 — Checagem de unicidade na atualização limitada à primeira página**



**\*\*Localização:\*\* `src/users/user.service.js`, `updateEmail`**



**```js**

**const users = await this.userRepository.findAll({ page: 0, size: 100 });**

**const emailInUse = users.some((other) => other.email === email \&\& other.id !== user.id);**

**```**



**\*\*Problema:\*\* a verificação percorre apenas os 100 primeiros usuários retornados pela paginação. A partir do 101º registro, um e-mail já utilizado não é detectado. O repositório já oferece `findByEmail`, que faria a busca completa.**



**\*\*Comportamento esperado:\*\* a atualização deve ser rejeitada sempre que o novo e-mail pertencer a outro usuário, qualquer que seja sua posição na base.**



**\*\*Comportamento atual:\*\* com mais de 100 usuários cadastrados, a atualização é aceita e passam a existir dois usuários com o mesmo e-mail.**



**\*\*Requisito relacionado:\*\* CA34.**



**---**



**### Pontos verificados sem defeito**



**- \*\*CA35/CA36:\*\* em `updateEmail`, todas as rejeições (usuário inexistente, e-mail inválido, e-mail em uso) ocorrem antes de qualquer mutação do objeto, então os dados do usuário não são alterados em caso de rejeição.**

**- \*\*CA34 (manter o próprio e-mail):\*\* o filtro `other.id !== user.id` permite corretamente reenviar o próprio e-mail.**

**- \*\*Paginação em `listUsers`:\*\* valores não numéricos viram `NaN` e são barrados por `Number.isInteger`; ausência de parâmetro cai nos defaults.**

**- \*\*`save` com `index === -1`:\*\* o caminho que inseriria um usuário inexistente não é alcançável, pois `updateEmail` já verifica a existência antes.**

