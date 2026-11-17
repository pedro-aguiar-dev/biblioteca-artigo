Encontrei \*\*4 defeitos funcionais\*\* no Pull Request.



| Localização | Descrição do problema | Comportamento esperado | Comportamento atual | Requisito relacionado |

|---|---|---|---|---|

| `src/users/user.service.js`, `createUser()`, condição `existingUser \&\& existingUser.id === input.id` | A verificação de unicidade do e-mail está incorreta. No cadastro, qualquer usuário existente com o mesmo e-mail deve causar rejeição. A comparação com `input.id` faz com que, normalmente, o conflito não seja detectado, pois o usuário sendo criado ainda não possui ID. | Se `findByEmail(email)` retornar qualquer usuário existente, o cadastro deve ser rejeitado. | Um segundo usuário pode ser cadastrado com um e-mail já existente. | \*\*CA07\*\* — e-mail obrigatório e único. |

| `src/users/user.service.js`, `createUser()`, `if (isBlank(name) \&\& !isValidEmail(email))` | A validação usa `\&\&`, portanto rejeita somente quando \*\*nome e e-mail são inválidos simultaneamente\*\*. O requisito determina rejeição se qualquer uma dessas condições ocorrer. | Rejeitar quando `isBlank(name) \\|\\| !isValidEmail(email)`. | Um usuário com nome vazio e e-mail válido é aceito; da mesma forma, um usuário com nome válido e e-mail ausente/inválido é aceito. | \*\*CA08\*\* — nome vazio \*\*ou\*\* e-mail inválido deve causar rejeição; \*\*CA07\*\* — e-mail obrigatório. |

| `src/users/user.service.js`, `createUser()`, chamada a `userRepository.save()` antes da validação | O usuário é persistido antes de validar nome e e-mail. Quando ambos são inválidos, a validação lança erro somente depois de o registro já ter sido criado. | Todas as validações devem ocorrer antes de qualquer alteração persistente; uma tentativa rejeitada não pode criar usuário. | A requisição retorna erro, mas o usuário inválido permanece armazenado e passa a aparecer nas consultas posteriores. | \*\*CA09\*\* — tentativa inválida não deve criar parcialmente o usuário; \*\*RN08\*\* — operação rejeitada não pode modificar os dados do sistema. |

| `src/users/user.service.js`, `updateEmail()`, `findAll({ page: 0, size: 100 })` | A verificação de unicidade na atualização examina somente os primeiros 100 usuários. Se houver mais de 100 cadastrados, um e-mail pertencente a um usuário fora desse intervalo não será encontrado. | A verificação deve considerar \*\*todos os usuários\*\*, independentemente da paginação da listagem. Uma alternativa seria consultar diretamente `findByEmail(email)` e permitir apenas quando o registro encontrado for o próprio usuário. | Com mais de 100 usuários, é possível atualizar um usuário para um e-mail já pertencente ao 101º usuário ou posterior. | \*\*CA34\*\* — o e-mail deve continuar único. |



Um detalhe importante no terceiro defeito: com o código atual, quando \*\*apenas um\*\* dos campos é inválido, nem sequer ocorre rejeição por causa do segundo defeito. Quando \*\*ambos\*\* são inválidos, ocorre a rejeição, mas somente \*\*depois\*\* do `save`, violando CA09/RN08.

