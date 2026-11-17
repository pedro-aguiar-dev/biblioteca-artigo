Aqui estão os defeitos funcionais identificados na revisão do Pull Request, baseados nos requisitos e regras de negócio fornecidos:



\*\*1. Verificação de unicidade de e-mail falha no cadastro\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A condição de bloqueio de e-mail duplicado (`if (existingUser \&\& existingUser.id === input.id)`) é logicamente falha para um cenário de criação. Como os dados de entrada para criação não possuem `id`, a condição sempre será falsa se o e-mail existir (a menos que o usuário existente não tenha ID, o que é impossível).

\* \*\*Comportamento esperado:\*\* A tentativa de cadastro deve ser rejeitada imediatamente se o e-mail já pertencer a outro usuário.

\* \*\*Comportamento atual:\*\* O sistema permite o cadastro de múltiplos usuários com o mesmo e-mail.

\* \*\*Requisito relacionado:\*\* CA07 (O e-mail deve ser obrigatório e único).



\*\*2. O sistema salva o usuário antes de validar os campos\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A chamada `this.userRepository.save({ name, email })` ocorre antes da validação que verifica se o nome está em branco ou se o e-mail é válido.

\* \*\*Comportamento esperado:\*\* Uma tentativa inválida não deve gerar efeitos colaterais ou criar dados no sistema.

\* \*\*Comportamento atual:\*\* O sistema persiste o usuário no repositório com dados inválidos e só depois dispara o erro, deixando um registro incorreto criado.

\* \*\*Requisito relacionado:\*\* CA09 (Uma tentativa inválida não deve criar parcialmente o usuário) e RN08 (Uma operação rejeitada não pode modificar os dados do sistema).



\*\*3. Validação de dados incorreta no cadastro (uso de AND em vez de OR)\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A validação utiliza o operador `\&\&` (`if (isBlank(name) \&\& !isValidEmail(email))`).

\* \*\*Comportamento esperado:\*\* O cadastro deve ser rejeitado se o nome for vazio \*\*ou\*\* se o e-mail for inválido.

\* \*\*Comportamento atual:\*\* O cadastro só é rejeitado se o usuário enviar simultaneamente um nome vazio \*\*e\*\* um e-mail inválido. Enviar apenas um nome vazio ou apenas um e-mail inválido resulta em sucesso.

\* \*\*Requisito relacionado:\*\* CA08 (Nome vazio ou e-mail inválido deve causar a rejeição do cadastro).



\*\*4. A verificação de unicidade na atualização de e-mail é limitada (paginada)\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `updateEmail`.

\* \*\*Descrição do problema:\*\* Para verificar se o novo e-mail já está em uso, o código busca apenas a primeira página do repositório (`this.userRepository.findAll({ page: 0, size: 100 })`) em vez de buscar o e-mail em toda a base (usando `findByEmail`).

\* \*\*Comportamento esperado:\*\* O sistema deve garantir que o e-mail não pertence a nenhum outro usuário cadastrado, independente da quantidade de usuários.

\* \*\*Comportamento atual:\*\* Se o e-mail já estiver em uso por um usuário que não seja retornado entre os 100 primeiros registros, a validação não detectará a duplicidade e permitirá a atualização.

\* \*\*Requisito relacionado:\*\* CA34 (O e-mail deve continuar único: não pode pertencer a outro usuário).

