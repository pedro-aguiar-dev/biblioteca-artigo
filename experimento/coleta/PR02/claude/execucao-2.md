\# Revisão de Código — RF02 / RF07



Foram identificados \*\*4 defeitos funcionais\*\*.



\---



\## Defeito 1 — Verificação de unicidade de e-mail no cadastro nunca é acionada



\*\*Localização:\*\* `src/users/user.service.js`, `createUser` (linhas da condição `if (existingUser \&\& existingUser.id === input.id)`)



\*\*Descrição:\*\* A condição compara `existingUser.id` com `input.id`. No cadastro, `input` é o corpo da requisição, que não possui `id` (`undefined`), enquanto `existingUser.id` é sempre um número gerado pelo repositório. A comparação é sempre falsa, de modo que a exceção `EMAIL\_ALREADY\_EXISTS` nunca é lançada. A lógica também está invertida: a duplicidade deveria ser rejeitada justamente quando existe um usuário com aquele e-mail, independentemente de ids.



\*\*Comportamento esperado:\*\* Cadastro com e-mail já pertencente a outro usuário deve ser rejeitado (409), sem criar o registro.



\*\*Comportamento atual:\*\* O cadastro é aceito e são persistidos múltiplos usuários com o mesmo e-mail.



\*\*Requisito relacionado:\*\* CA07.



\---



\## Defeito 2 — Usuário é persistido antes da validação



\*\*Localização:\*\* `src/users/user.service.js`, `createUser` — chamada de `this.userRepository.save({ name, email })` ocorre antes do bloco `if (isBlank(name) \&\& !isValidEmail(email))`.



\*\*Descrição:\*\* A gravação acontece antes de qualquer validação de nome e e-mail. Quando a validação falha, a exceção é lançada, mas o usuário já foi inserido no repositório e o id já foi consumido. Não há rollback.



\*\*Comportamento esperado:\*\* Uma tentativa inválida deve ser rejeitada sem qualquer alteração no estado do sistema; nenhum usuário deve ser criado.



\*\*Comportamento atual:\*\* A requisição retorna erro, porém o usuário inválido permanece armazenado e passa a aparecer em `GET /users`.



\*\*Requisito relacionado:\*\* CA09 e RN08.



\---



\## Defeito 3 — Condição de validação do cadastro usa `\&\&` em vez de `||`



\*\*Localização:\*\* `src/users/user.service.js`, `createUser` — `if (isBlank(name) \&\& !isValidEmail(email))`



\*\*Descrição:\*\* O cadastro só é rejeitado quando o nome está vazio \*\*e\*\* o e-mail é inválido simultaneamente. Cada condição isolada deveria ser suficiente para rejeitar. Como consequência, também passam cadastros sem e-mail algum (`email` ausente, com nome preenchido), violando a obrigatoriedade do campo.



\*\*Comportamento esperado:\*\* Rejeitar o cadastro se o nome for vazio \*\*ou\*\* se o e-mail for inválido/ausente.



\*\*Comportamento atual:\*\*

\- Nome vazio + e-mail válido → aceito e armazenado.

\- Nome válido + e-mail inválido ou ausente → aceito e armazenado.

\- Apenas a combinação de ambos inválidos é rejeitada (e, ainda assim, após a persistência — ver Defeito 2).



\*\*Requisito relacionado:\*\* CA08 e CA07 (obrigatoriedade do e-mail).



\---



\## Defeito 4 — Verificação de unicidade na atualização limitada aos 100 primeiros usuários



\*\*Localização:\*\* `src/users/user.service.js`, `updateEmail` — `const users = await this.userRepository.findAll({ page: 0, size: 100 });`



\*\*Descrição:\*\* A checagem de e-mail já em uso é feita sobre uma página fixa de no máximo 100 registros, em vez de consultar o repositório pelo e-mail (`findByEmail`, que já existe e está disponível). Usuários a partir da posição 101 não são considerados na verificação.



\*\*Comportamento esperado:\*\* A atualização deve ser rejeitada sempre que o novo e-mail pertencer a outro usuário, independentemente da quantidade de usuários cadastrados.



\*\*Comportamento atual:\*\* Com mais de 100 usuários, é possível atribuir a um usuário um e-mail que já pertence a outro armazenado fora da primeira página, resultando em e-mails duplicados.



\*\*Requisito relacionado:\*\* CA34 (e, indiretamente, CA07).



\---



\## Pontos verificados sem defeito



\- \*\*CA33 / CA35 / CA36:\*\* em `updateEmail`, a busca do usuário, a validação do e-mail e a checagem de duplicidade ocorrem todas antes da mutação `user.email = email`, portanto uma atualização rejeitada não altera os dados. Usuário inexistente retorna 404 corretamente.

\- \*\*Manter o próprio e-mail:\*\* a cláusula `other.id !== user.id` permite corretamente que o usuário mantenha o próprio e-mail.

\- \*\*Paginação:\*\* `start = page \* size` é consistente com o `page` base-zero e com os defaults de `listUsers`; a validação de `page`/`size` cobre valores negativos, não inteiros e acima do máximo.

