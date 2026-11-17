\## Revisão de código — PR de cadastro e atualização de e-mail



Foram encontrados \*\*4 defeitos funcionais\*\*.



\---



\### Defeito 1 — Usuário é persistido antes da validação



\*\*Localização:\*\* `src/users/user.service.js`, `UserService.createUser` (chamada `this.userRepository.save({ name, email })` antes do bloco de validação).



\*\*Descrição:\*\* O `save` é executado antes da verificação de nome/e-mail. Quando a validação falha e o `AppError` é lançado, o usuário já foi inserido no repositório e recebeu um id, permanecendo na base.



\*\*Comportamento esperado:\*\* Uma tentativa inválida de cadastro não deve criar o usuário, nem parcialmente; o estado do sistema deve permanecer inalterado.



\*\*Comportamento atual:\*\* O usuário é gravado e permanece listável via `GET /users` mesmo com a requisição retornando erro.



\*\*Requisito relacionado:\*\* CA09 e RN08.



\---



\### Defeito 2 — Condição de validação usa `\&\&` em vez de `||`



\*\*Localização:\*\* `src/users/user.service.js`, `UserService.createUser`: `if (isBlank(name) \&\& !isValidEmail(email))`.



\*\*Descrição:\*\* A rejeição só ocorre quando \*\*ambas\*\* as condições são inválidas. Entradas com apenas um dos campos inválidos passam na validação.



\*\*Comportamento esperado:\*\* Nome vazio \*\*ou\*\* e-mail inválido deve rejeitar o cadastro. Também decorre daí que e-mail ausente/inválido com nome válido deve ser rejeitado (e-mail é obrigatório).



\*\*Comportamento atual:\*\*

\- `{ name: "", email: "ana@ex.com" }` → cadastrado com nome vazio (HTTP 201).

\- `{ name: "Ana" }` (sem e-mail) ou `{ name: "Ana", email: "invalido" }` → cadastrado com e-mail inválido/indefinido (HTTP 201).



\*\*Requisito relacionado:\*\* CA06, CA07 e CA08.



\---



\### Defeito 3 — Verificação de unicidade de e-mail no cadastro nunca dispara



\*\*Localização:\*\* `src/users/user.service.js`, `UserService.createUser`: `if (existingUser \&\& existingUser.id === input.id)`.



\*\*Descrição:\*\* No cadastro, `input.id` é sempre `undefined` (o id é gerado pelo repositório), enquanto `existingUser.id` é sempre um número. A comparação é sempre falsa, portanto a exceção `EMAIL\_ALREADY\_EXISTS` nunca é lançada. A condição está invertida em relação à intenção: deveria rejeitar quando o e-mail já existe, independentemente de id.



\*\*Comportamento esperado:\*\* Cadastrar um e-mail já pertencente a outro usuário deve ser rejeitado (HTTP 409) e nenhum registro deve ser criado.



\*\*Comportamento atual:\*\* O segundo cadastro com o mesmo e-mail é aceito (HTTP 201), gerando dois usuários com e-mails duplicados.



\*\*Requisito relacionado:\*\* CA07.



\---



\### Defeito 4 — Unicidade na atualização verifica apenas os 100 primeiros usuários



\*\*Localização:\*\* `src/users/user.service.js`, `UserService.updateEmail`: `await this.userRepository.findAll({ page: 0, size: 100 })`.



\*\*Descrição:\*\* A checagem de duplicidade é feita sobre uma página fixa em vez de consultar o e-mail diretamente (há `findByEmail` disponível no repositório). Usuários fora dessa primeira página não são considerados.



\*\*Comportamento esperado:\*\* O novo e-mail deve ser rejeitado sempre que pertencer a qualquer outro usuário da base, independentemente da quantidade de registros.



\*\*Comportamento atual:\*\* Com mais de 100 usuários, atualizar para um e-mail pertencente ao usuário de índice 100 ou superior é aceito, resultando em e-mails duplicados.



\*\*Requisito relacionado:\*\* CA34.



\---



\### Pontos verificados sem defeito



\- `CA35`: usuário inexistente retorna 404 antes de qualquer escrita.

\- `CA36`: em `updateEmail`, todas as validações ocorrem antes da mutação de `user.email`, portanto rejeições não alteram os dados.

\- Manter o próprio e-mail é permitido pela condição `other.id !== user.id`.

\- `listUsers`: id não numérico em `PATCH /users/:id/email` vira `NaN`, `findById` retorna `null` e a operação é rejeitada corretamente.

