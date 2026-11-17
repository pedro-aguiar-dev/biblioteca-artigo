Aqui estão os defeitos funcionais encontrados no Pull Request, avaliados com base nos requisitos e regras de negócio:



\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/users/user.service.js` (método `createUser`)

\* \*\*Descrição do problema:\*\* A operação de escrita no banco (`this.userRepository.save`) está sendo chamada antes da validação da validade do nome e do e-mail. Se os dados forem inválidos, a exceção será lançada, mas o registro já terá sido persistido no repositório.

\* \*\*Comportamento esperado:\*\* A validação de negócio sobre os dados de entrada deve ocorrer antes de qualquer operação de gravação no repositório.

\* \*\*Comportamento atual:\*\* O usuário é salvo primeiro na base de dados. Quando os dados (nome ou e-mail) são inválidos, o sistema retorna um erro, mas o usuário permanece salvo de forma parcial/indevida.

\* \*\*Requisito relacionado:\*\* CA09 (Uma tentativa inválida não deve criar parcialmente o usuário) e RN08 (Uma operação rejeitada não pode modificar os dados do sistema).



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/users/user.service.js` (método `createUser`)

\* \*\*Descrição do problema:\*\* A lógica para barrar e-mails duplicados está com a condição incorreta: `if (existingUser \&\& existingUser.id === input.id)`. Como um novo cadastro não possui um `id` prévio no `input`, essa verificação sempre falhará, impedindo que a exceção de e-mail existente seja lançada.

\* \*\*Comportamento esperado:\*\* O cadastro deve ser rejeitado se o método `findByEmail` retornar que já existe algum usuário no sistema utilizando o e-mail solicitado.

\* \*\*Comportamento atual:\*\* O sistema está permitindo o cadastro sucessivo de múltiplos usuários utilizando exatamente o mesmo e-mail.

\* \*\*Requisito relacionado:\*\* CA07 (O e-mail deve ser obrigatório e único).



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/users/user.service.js` (método `createUser`)

\* \*\*Descrição do problema:\*\* A validação de campos utiliza incorretamente o operador lógico `\&\&` (E) na instrução `if (isBlank(name) \&\& !isValidEmail(email))`.

\* \*\*Comportamento esperado:\*\* A rejeição deve ocorrer se o nome for vazio \*\*ou\*\* se o e-mail for inválido (operador `||`).

\* \*\*Comportamento atual:\*\* O cadastro só é barrado se o nome for vazio \*\*e\*\* o e-mail for inválido ao mesmo tempo. Cadastros com nome vazio e e-mail válido (ou vice-versa) são indevidamente aceitos.

\* \*\*Requisito relacionado:\*\* CA08 (Nome vazio ou e-mail inválido deve causar a rejeição do cadastro).



\*\*Defeito 4\*\*



\* \*\*Localização:\*\* `src/users/user.service.js` (método `updateEmail`)

\* \*\*Descrição do problema:\*\* Para verificar se o novo e-mail já pertence a outro usuário, o código realiza uma busca restrita à primeira página de paginação do repositório (`this.userRepository.findAll({ page: 0, size: 100 })`).

\* \*\*Comportamento esperado:\*\* O sistema deve verificar a duplicidade do e-mail considerando a base completa de usuários (ex: reutilizando o método `findByEmail` do repositório).

\* \*\*Comportamento atual:\*\* Se houver mais de 100 usuários cadastrados e o e-mail alvo já estiver em uso por um usuário que se encontra na página seguinte de resultados, a validação passará incorretamente, burlando a unicidade.

\* \*\*Requisito relacionado:\*\* CA34 (O e-mail deve continuar único: não pode pertencer a outro usuário).

