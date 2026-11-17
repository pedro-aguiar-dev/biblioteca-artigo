\# Revisão de código — RF02 / RF07



Encontrei 4 defeitos funcionais.



\---



\## Defeito 1 — Validação executada depois da persistência



\*\*Localização:\*\* `src/users/user.service.js`, `createUser` (linhas do `save` e do `if (isBlank...)`)



\*\*Problema:\*\* o `userRepository.save({ name, email })` é chamado antes da verificação de nome/e-mail. Quando a validação falha, o usuário já foi inserido no repositório e o `#nextId` já foi incrementado; o erro lançado não desfaz a escrita.



\*\*Comportamento esperado:\*\* uma tentativa inválida é rejeitada sem criar o usuário, deixando o estado do sistema inalterado.



\*\*Comportamento atual:\*\* o usuário inválido é armazenado e passa a aparecer em `GET /users`, mesmo com a requisição retornando erro.



\*\*Requisito relacionado:\*\* CA09, RN08 (e CA08 parcialmente).



\---



\## Defeito 2 — Condição de validação usa `\&\&` em vez de `||`



\*\*Localização:\*\* `src/users/user.service.js`, `createUser`: `if (isBlank(name) \&\& !isValidEmail(email))`



\*\*Problema:\*\* o cadastro só é rejeitado quando o nome está vazio \*\*e\*\* o e-mail é inválido simultaneamente. Cada condição isolada passa.



\*\*Comportamento esperado:\*\* rejeitar o cadastro se o nome for vazio \*\*ou\*\* se o e-mail for inválido/ausente.



\*\*Comportamento atual:\*\* `{ name: "", email: "ana@exemplo.com" }` e `{ name: "Ana", email: "invalido" }` são aceitos. Como `isValidEmail(undefined)` é `false` mas o nome é válido, um cadastro sem e-mail também é aceito, quebrando a obrigatoriedade.



\*\*Requisito relacionado:\*\* CA08, CA06, CA07 (obrigatoriedade).



\---



\## Defeito 3 — Verificação de unicidade de e-mail no cadastro nunca dispara



\*\*Localização:\*\* `src/users/user.service.js`, `createUser`: `if (existingUser \&\& existingUser.id === input.id)`



\*\*Problema:\*\* no cadastro, `input.id` é `undefined` (o corpo da requisição contém apenas nome e e-mail), enquanto `existingUser.id` é sempre um número atribuído pelo repositório. A comparação é sempre falsa, então o `409` nunca é lançado. A condição correta seria apenas `if (existingUser)`.



\*\*Comportamento esperado:\*\* cadastro com e-mail já pertencente a outro usuário é rejeitado com conflito.



\*\*Comportamento atual:\*\* dois ou mais usuários com o mesmo e-mail são criados normalmente, duplicando a chave que deveria ser única.



\*\*Requisito relacionado:\*\* CA07.



\---



\## Defeito 4 — Unicidade na atualização verificada apenas sobre os 100 primeiros usuários



\*\*Localização:\*\* `src/users/user.service.js`, `updateEmail`: `const users = await this.userRepository.findAll({ page: 0, size: 100 })`



\*\*Problema:\*\* a checagem de duplicidade é feita sobre uma página fixa do repositório em vez de uma busca direta por e-mail (`findByEmail`, que já existe). Usuários fora dessa primeira página não entram na comparação.



\*\*Comportamento esperado:\*\* a atualização é rejeitada sempre que o novo e-mail pertencer a qualquer outro usuário, independentemente da quantidade de registros.



\*\*Comportamento atual:\*\* com mais de 100 usuários cadastrados, atualizar para um e-mail que pertence a um usuário da posição 101 em diante é aceito, gerando e-mails duplicados.



\*\*Requisito relacionado:\*\* CA34.



\---



\*\*Sem defeitos identificados em:\*\* `listUsers` (validação de paginação e cálculo de offset estão corretos), `findById`/`findByEmail`, CA35 (id inexistente ou não numérico resulta em 404) e CA36 (em `updateEmail` todas as validações ocorrem antes da mutação do objeto).

