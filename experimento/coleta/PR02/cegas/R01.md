Encontrei \*\*4 defeitos funcionais\*\* relacionados diretamente aos requisitos informados.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/users/user.service.js`, `createUser()`, condição `if (existingUser \&\& existingUser.id === input.id)` | A verificação de unicidade do e-mail está incorreta. No cadastro, `input.id` normalmente é `undefined`, enquanto o usuário já existente possui um `id` numérico. Assim, mesmo que `findByEmail(email)` encontre outro usuário, a condição tende a ser falsa. | Se já existir qualquer usuário com o mesmo e-mail, o cadastro deve ser rejeitado. | Um segundo usuário pode ser cadastrado com um e-mail já existente. | \*\*CA07\*\* — e-mail deve ser único. |

| `src/users/user.service.js`, `createUser()`, condição `if (isBlank(name) \&\& !isValidEmail(email))` | A validação combina os dois erros com `\&\&`. Isso só rejeita o cadastro quando \*\*nome e e-mail são inválidos ao mesmo tempo\*\*. | O cadastro deve ser rejeitado se o nome estiver vazio \*\*ou\*\* se o e-mail for inválido/ausente. | `name=""` com e-mail válido é aceito; nome válido com e-mail inválido ou ausente também é aceito. | \*\*CA07\*\* — e-mail obrigatório; \*\*CA08\*\* — nome vazio ou e-mail inválido deve rejeitar o cadastro. |

| `src/users/user.service.js`, `createUser()`, chamada a `save()` antes da validação | O usuário é persistido antes da validação dos dados. Quando nome vazio \*\*e\*\* e-mail inválido fazem a validação lançar `AppError`, o registro já permanece no repositório. | Uma tentativa inválida deve ser rejeitada sem modificar o estado do sistema. | A requisição retorna erro, mas o usuário inválido já foi inserido em `#users`. Além disso, `#nextId` já foi incrementado. | \*\*CA09\*\* — tentativa inválida não deve criar parcialmente o usuário; \*\*RN08\*\* — operação rejeitada não pode modificar os dados do sistema. |

| `src/users/user.service.js`, `updateEmail()`, `findAll({ page: 0, size: 100 })` | A verificação de unicidade durante atualização consulta apenas os primeiros 100 usuários. Usuários além dessa faixa não participam da validação. | O novo e-mail deve ser comparado contra \*\*todos\*\* os demais usuários, independentemente da paginação da listagem. | Com mais de 100 usuários, é possível alterar o e-mail para um valor já pertencente, por exemplo, ao usuário 101, criando duplicidade. | \*\*CA34\*\* — o e-mail deve continuar único. |



\### Trechos críticos



No cadastro, estas duas partes combinadas são especialmente problemáticas:



```js

const user = await this.userRepository.save({ name, email });



if (isBlank(name) \&\& !isValidEmail(email)) {

&#x20; throw new AppError("INVALID\_USER");

}

```



A validação deveria ocorrer \*\*antes da persistência\*\* e deveria rejeitar quando \*\*qualquer\*\* uma das condições inválidas ocorrer.



Também, para cadastro, a existência de `existingUser` por si só já representa conflito:



```js

if (existingUser \&\& existingUser.id === input.id)

```



A comparação com `input.id` não é compatível com o requisito de criação, pois o cliente não precisa fornecer identificador para determinar a unicidade.

