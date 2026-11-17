Encontrei \*\*4 defeitos funcionais\*\* no PR.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/users/user.service.js`, `createUser()`, condição `if (existingUser \&\& existingUser.id === input.id)` | A verificação de unicidade do e-mail está incorreta. No cadastro, `input.id` não é usado para criar o usuário e normalmente será `undefined`. Portanto, quando já existe um usuário com o mesmo e-mail, `existingUser.id === input.id` será falso e o cadastro continuará. | Se qualquer usuário já possuir o e-mail informado, o cadastro deve ser rejeitado. | É possível cadastrar múltiplos usuários com o mesmo e-mail. | \*\*CA07\*\* — e-mail obrigatório e único. |

| `src/users/user.service.js`, `createUser()`, condição `if (isBlank(name) \&\& !isValidEmail(email))` | A validação usa `\&\&`, portanto só rejeita quando \*\*nome e e-mail são inválidos simultaneamente\*\*. Cada condição deveria ser suficiente para rejeitar o cadastro. | Nome vazio \*\*ou\*\* e-mail inválido/ausente deve rejeitar o cadastro. | Um usuário com nome vazio e e-mail válido é aceito; da mesma forma, um usuário com nome válido e e-mail inválido ou ausente é aceito. | \*\*CA08\*\* — nome vazio ou e-mail inválido deve causar rejeição; \*\*CA07\*\* — e-mail obrigatório. |

| `src/users/user.service.js`, `createUser()`, chamada `userRepository.save({ name, email })` antes da validação | O usuário é persistido antes de verificar se os dados são válidos. Mesmo quando a validação posterior lança `AppError`, o registro já permanece no repositório. | Uma tentativa de cadastro inválida deve ser rejeitada sem produzir nenhuma alteração nos dados. | Quando a condição de validação é atingida, a API retorna erro, mas o usuário já foi inserido e aparecerá posteriormente no sistema. | \*\*CA09\*\* — tentativa inválida não deve criar parcialmente o usuário; \*\*RN08\*\* — operação rejeitada não pode modificar os dados do sistema. |

| `src/users/user.service.js`, `updateEmail()`, `findAll({ page: 0, size: 100 })` | A verificação de unicidade na atualização considera somente os primeiros 100 usuários. Como o repositório pode armazenar mais de 100 registros, um e-mail pertencente a um usuário fora dessa primeira página não será detectado. | O novo e-mail deve ser comparado contra \*\*todos\*\* os demais usuários. | A partir do 101º usuário, pode ser possível atualizar outro usuário para um e-mail já existente. | \*\*CA34\*\* — e-mail deve continuar único. |



Os demais fluxos visíveis de `updateEmail()` preservam corretamente os dados quando o usuário não existe, o e-mail é inválido ou uma duplicidade é encontrada dentro do conjunto consultado.

