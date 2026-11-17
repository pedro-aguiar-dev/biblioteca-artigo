Foram identificados 4 defeitos funcionais no Pull Request:



\*\*1. Verificação incorreta de unicidade de e-mail no cadastro\*\*



\* \*\*Localização:\*\* `UserService.createUser` (condição `if (existingUser \&\& existingUser.id === input.id)`)

\* \*\*Descrição do problema:\*\* A lógica para barrar e-mails duplicados no cadastro está falha. Como no momento da criação o `input` normalmente não possui `id` (ou ele será diferente de um usuário já salvo), a condição `existingUser.id === input.id` será falsa e o erro nunca será lançado.

\* \*\*Comportamento esperado:\*\* A tentativa de cadastro deve ser rejeitada se já houver qualquer usuário com o e-mail informado.

\* \*\*Comportamento atual:\*\* O sistema permite criar novos usuários utilizando e-mails que já existem no sistema.

\* \*\*Requisito relacionado:\*\* CA07 (O e-mail deve ser obrigatório e único).



\*\*2. Persistência de dados antes da validação no cadastro\*\*



\* \*\*Localização:\*\* `UserService.createUser` (chamada `await this.userRepository.save({ name, email })`)

\* \*\*Descrição do problema:\*\* O código salva o usuário no repositório \*antes\* de executar a validação de nome e e-mail. Se a validação falhar na linha seguinte, o erro será lançado para o cliente, mas o dado inválido já terá sido salvo no sistema.

\* \*\*Comportamento esperado:\*\* O usuário só deve ser salvo após todas as regras e validações de input passarem com sucesso.

\* \*\*Comportamento atual:\*\* Um usuário com dados inválidos é criado e armazenado no sistema de forma permanente, mesmo a requisição sendo rejeitada e retornando erro.

\* \*\*Requisito relacionado:\*\* CA09 (Uma tentativa inválida não deve criar parcialmente o usuário) e RN08 (Uma operação rejeitada não pode modificar os dados do sistema).



\*\*3. Operador lógico incorreto na validação de cadastro\*\*



\* \*\*Localização:\*\* `UserService.createUser` (condição `if (isBlank(name) \&\& !isValidEmail(email))`)

\* \*\*Descrição do problema:\*\* O uso do operador `\&\&` (E) exige que \*ambos\* os campos estejam inválidos ao mesmo tempo para que o cadastro seja barrado.

\* \*\*Comportamento esperado:\*\* O cadastro deve ser rejeitado se o nome for vazio \*\*ou\*\* se o e-mail for inválido (operador `||`).

\* \*\*Comportamento atual:\*\* O sistema cadastra com sucesso um usuário sem nome (desde que o e-mail seja válido) ou um usuário com e-mail inválido (desde que tenha nome).

\* \*\*Requisito relacionado:\*\* CA08 (Nome vazio ou e-mail inválido deve causar a rejeição do cadastro).



\*\*4. Verificação de unicidade de e-mail limitada por paginação na atualização\*\*



\* \*\*Localização:\*\* `UserService.updateEmail` (chamada `await this.userRepository.findAll({ page: 0, size: 100 })`)

\* \*\*Descrição do problema:\*\* Para checar se o novo e-mail já está em uso, o sistema busca apenas a primeira página de usuários (limitado a 100 registros). Caso o e-mail duplicado pertença ao 101º usuário em diante, o sistema não o detectará. O correto seria utilizar `findByEmail(email)`.

\* \*\*Comportamento esperado:\*\* A atualização deve garantir que o e-mail seja único considerando toda a base de dados de usuários.

\* \*\*Comportamento atual:\*\* O sistema permite a atualização para um e-mail já pertencente a outro usuário, contanto que este outro usuário não seja retornado nos 100 primeiros registros da listagem.

\* \*\*Requisito relacionado:\*\* CA34 (O e-mail deve continuar único: não pode pertencer a outro usuário).

