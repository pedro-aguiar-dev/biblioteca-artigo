\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A verificação de e-mail duplicado está condicionada a `existingUser.id === input.id`. Como no cadastro o `input.id` não costuma existir (é gerado no repositório), essa condição será falsa, burlando a verificação.

\* \*\*Comportamento esperado:\*\* A operação deve ser rejeitada se o e-mail informado já estiver cadastrado no sistema.

\* \*\*Comportamento atual:\*\* O sistema permite o cadastro de múltiplos usuários com o mesmo e-mail.

\* \*\*Requisito relacionado:\*\* CA07 (O e-mail deve ser obrigatório e único).



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A chamada `this.userRepository.save({ name, email })` é executada antes das validações de formato de nome e e-mail.

\* \*\*Comportamento esperado:\*\* Uma tentativa de cadastro com dados inválidos não deve inserir ou alterar dados no sistema.

\* \*\*Comportamento atual:\*\* O usuário é salvo no repositório. Em seguida, se os dados forem inválidos, a exceção é lançada, mas o registro já foi criado indevidamente e persiste no banco (array em memória).

\* \*\*Requisito relacionado:\*\* CA09 (Uma tentativa inválida não deve criar parcialmente o usuário) e RN08.



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A validação utiliza o operador lógico `\&\&` (`isBlank(name) \&\& !isValidEmail(email)`).

\* \*\*Comportamento esperado:\*\* O cadastro deve ser rejeitado se o nome for vazio \*\*ou\*\* se o e-mail for inválido.

\* \*\*Comportamento atual:\*\* O sistema só rejeita o cadastro se \*\*ambos\*\* forem inválidos simultaneamente. Permite criar usuário com nome vazio (desde que o e-mail seja válido) ou com e-mail inválido (desde que o nome não seja vazio).

\* \*\*Requisito relacionado:\*\* CA08 (Nome vazio ou e-mail inválido deve causar a rejeição do cadastro).



\*\*Defeito 4\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `updateEmail`.

\* \*\*Descrição do problema:\*\* A checagem para garantir que o novo e-mail não pertence a outro usuário busca apenas a primeira página de usuários (`findAll({ page: 0, size: 100 })`).

\* \*\*Comportamento esperado:\*\* A verificação de unicidade deve buscar o e-mail em toda a base de dados (utilizando o método `findByEmail`, por exemplo).

\* \*\*Comportamento atual:\*\* Se um usuário tentar atualizar seu e-mail para um e-mail já existente, e o dono desse e-mail não estiver entre os primeiros 100 registros retornados pela paginação, o sistema permitirá a atualização, gerando duplicidade.

\* \*\*Requisito relacionado:\*\* CA34 (O e-mail deve continuar único: não pode pertencer a outro usuário).

