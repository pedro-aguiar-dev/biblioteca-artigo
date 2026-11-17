Encontrei \*\*4 defeitos funcionais\*\* no Pull Request.



| # | Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|---|

| 1 | `src/users/user.service.js`, `createUser()`, condição `existingUser \&\& existingUser.id === input.id` | A verificação de unicidade do e-mail está incorreta. No cadastro normal, `input.id` tende a ser `undefined`; portanto, mesmo que `findByEmail(email)` encontre outro usuário, a condição normalmente será falsa. | Se já existir \*\*qualquer usuário\*\* com o e-mail informado, o cadastro deve ser rejeitado. | É possível cadastrar vários usuários com o mesmo e-mail. | \*\*CA07\*\* — e-mail obrigatório e único. |

| 2 | `src/users/user.service.js`, `createUser()`, condição `if (isBlank(name) \&\& !isValidEmail(email))` | A validação usa `\&\&`, exigindo que \*\*nome e e-mail sejam inválidos simultaneamente\*\* para rejeitar o cadastro. | Nome vazio \*\*ou\*\* e-mail inválido deve ser suficiente para rejeitar o cadastro. | Um usuário com nome vazio e e-mail válido é aceito; da mesma forma, um usuário com nome válido e e-mail inválido/ausente é aceito. | \*\*CA08\*\* — nome vazio ou e-mail inválido deve causar rejeição; \*\*CA07\*\* — e-mail obrigatório. |

| 3 | `src/users/user.service.js`, `createUser()`, chamada a `userRepository.save()` antes da validação | O usuário é persistido \*\*antes\*\* de verificar a validade de nome/e-mail. Mesmo nos casos em que a validação posterior rejeita a operação, o registro já permanece no repositório. | Toda validação deve ocorrer antes da persistência; um cadastro rejeitado não pode produzir alteração no sistema. | Quando nome \*\*e\*\* e-mail são inválidos, `save()` cria o usuário e somente depois `AppError("INVALID\_USER")` é lançado. O cliente recebe erro, mas o usuário fica cadastrado. | \*\*CA09\*\* — tentativa inválida não deve criar parcialmente o usuário; \*\*RN08\*\* — operação rejeitada não pode modificar dados do sistema. |

| 4 | `src/users/user.service.js`, `updateEmail()`, `findAll({ page: 0, size: 100 })` | A verificação de unicidade na atualização considera apenas os primeiros 100 usuários do repositório. | O novo e-mail deve ser comparado contra \*\*todos os demais usuários\*\*, independentemente da quantidade cadastrada. | Se o proprietário do e-mail estiver a partir do 101º registro, `emailInUse` será falso e outro usuário poderá assumir o mesmo e-mail. | \*\*CA34\*\* — o e-mail deve continuar único. |



\### Exemplos que demonstram os defeitos



\*\*Defeito 1 — duplicidade no cadastro\*\*

```text

POST /users

{ "name": "Ana", "email": "ana@example.com" }



POST /users

{ "name": "Outra Ana", "email": "ana@example.com" }

```



O segundo cadastro também será salvo, pois `existingUser.id === input.id` resulta normalmente em `1 === undefined`, isto é, `false`.



\*\*Defeito 2 — validação com `\&\&`\*\*

```text

POST /users

{ "name": "", "email": "valid@example.com" }

```



`isBlank(name)` é `true`, mas `!isValidEmail(email)` é `false`; logo `true \&\& false` é `false` e o usuário é aceito.



\*\*Defeito 3 — persistência antes da rejeição\*\*

```text

POST /users

{ "name": "", "email": "invalid" }

```



O fluxo executa primeiro:



```js

const user = await this.userRepository.save({ name, email });

```



e somente depois lança `INVALID\_USER`. Assim, o cadastro retorna erro, mas o registro já está presente em `#users`.



Não identifiquei violação de \*\*CA33, CA35 ou CA36\*\* no fluxo normal de `updateEmail`: a existência do usuário e a validade do novo e-mail são verificadas antes da mutação do objeto.

