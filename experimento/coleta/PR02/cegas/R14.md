Analisei o PR e encontrei 4 defeitos funcionais.



\---



\### Defeito 1 — Verificação de e-mail único no cadastro nunca dispara



\*\*Localização:\*\* `src/users/user.service.js`, `createUser`, condição `if (existingUser \&\& existingUser.id === input.id)`



\*\*Problema:\*\* No cadastro, `input.id` é sempre `undefined` (o payload de criação não traz id, e o próprio serviço só desestrutura `name` e `email`). Já `existingUser.id` é sempre um número atribuído pelo repositório. A comparação `existingUser.id === input.id` é, portanto, sempre falsa, e o `AppError("EMAIL\_ALREADY\_EXISTS")` nunca é lançado.



\*\*Comportamento esperado:\*\* Cadastro com e-mail já pertencente a outro usuário deve ser rejeitado (409).



\*\*Comportamento atual:\*\* O cadastro é aceito e dois ou mais usuários passam a existir com o mesmo e-mail.



\*\*Requisito relacionado:\*\* CA07.



\---



\### Defeito 2 — Validação ocorre depois da persistência



\*\*Localização:\*\* `src/users/user.service.js`, `createUser` — o `save` acontece antes do bloco `if (isBlank(name) \&\& !isValidEmail(email))`



\*\*Problema:\*\* O usuário é gravado no repositório e só depois os dados são validados. Quando a validação falha, a exceção é lançada, mas o registro já foi inserido em `#users` e permanece lá, visível em `GET /users` e em `findByEmail`.



\*\*Comportamento esperado:\*\* Uma tentativa inválida de cadastro não deve deixar nenhum resquício no sistema; a validação deve preceder a persistência.



\*\*Comportamento atual:\*\* O usuário inválido é criado e persiste mesmo com a requisição retornando erro.



\*\*Requisito relacionado:\*\* CA09 e RN08.



\---



\### Defeito 3 — Condição de rejeição usa `\&\&` em vez de `||`



\*\*Localização:\*\* `src/users/user.service.js`, `createUser`, `if (isBlank(name) \&\& !isValidEmail(email))`



\*\*Problema:\*\* A rejeição só acontece quando \*ambas\* as condições são verdadeiras. Um cadastro com nome vazio e e-mail válido, ou com nome válido e e-mail inválido (inclusive ausente), passa pela validação sem erro.



\*\*Comportamento esperado:\*\* Nome vazio \*\*ou\*\* e-mail inválido deve rejeitar o cadastro.



\*\*Comportamento atual:\*\* Apenas o caso em que nome e e-mail estão simultaneamente inválidos é rejeitado; os demais são aceitos e armazenados.



\*\*Requisito relacionado:\*\* CA08 (e, indiretamente, CA06, já que o repositório passa a conter dados inválidos).



\---



\### Defeito 4 — Checagem de unicidade na atualização limitada aos 100 primeiros usuários



\*\*Localização:\*\* `src/users/user.service.js`, `updateEmail`, `const users = await this.userRepository.findAll({ page: 0, size: 100 })`



\*\*Problema:\*\* A unicidade é verificada apenas sobre a primeira página de 100 registros, em vez de consultar o repositório pelo e-mail (`findByEmail`, que já existe). A partir do 101º usuário cadastrado, um e-mail pertencente a um usuário fora dessa janela não é detectado.



\*\*Comportamento esperado:\*\* A atualização deve ser rejeitada sempre que o novo e-mail pertencer a outro usuário, independentemente da quantidade de usuários na base.



\*\*Comportamento atual:\*\* Com mais de 100 usuários, a atualização é aceita e a base passa a ter e-mails duplicados.



\*\*Requisito relacionado:\*\* CA34.



\---



\*\*Observação sobre o que não é defeito:\*\* a ordem das verificações em `updateEmail` está correta — usuário inexistente, e-mail inválido e e-mail em uso são todos checados antes da mutação `user.email = email`, de modo que uma rejeição não altera os dados (CA35, CA36 e RN08 atendidos nesse fluxo, ressalvado o Defeito 4). A permissão de manter o próprio e-mail também está contemplada pelo filtro `other.id !== user.id`.

