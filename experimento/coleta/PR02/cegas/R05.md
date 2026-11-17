\*\*Defeito 1\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A lógica para verificar se o e-mail já existe valida se `existingUser.id === input.id`. Como em uma operação de criação o `input.id` é indefinido, a condição será falsa e o erro `EMAIL\_ALREADY\_EXISTS` nunca será lançado para novos cadastros.

\* \*\*Comportamento esperado:\*\* O sistema deve rejeitar o cadastro caso já exista qualquer usuário com o e-mail informado.

\* \*\*Comportamento atual:\*\* O sistema permite o cadastro de múltiplos usuários com o mesmo e-mail.

\* \*\*Requisito relacionado:\*\* CA07.



\---



\*\*Defeito 2\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A validação dos dados de entrada utiliza o operador lógico `\&\&` (`isBlank(name) \&\& !isValidEmail(email)`).

\* \*\*Comportamento esperado:\*\* O cadastro deve ser rejeitado se o nome for vazio \*\*ou\*\* se o e-mail for inválido.

\* \*\*Comportamento atual:\*\* O cadastro só é rejeitado se \*\*ambos\*\* (nome vazio e e-mail inválido) ocorrerem simultaneamente. Se apenas um deles for inválido, o cadastro é aceito.

\* \*\*Requisito relacionado:\*\* CA08.



\---



\*\*Defeito 3\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `createUser`.

\* \*\*Descrição do problema:\*\* A persistência no repositório (`await this.userRepository.save(...)`) é chamada antes da validação que verifica se o nome está em branco ou se o e-mail é inválido.

\* \*\*Comportamento esperado:\*\* Uma tentativa de cadastro com dados inválidos deve ser rejeitada sem alterar o estado do sistema.

\* \*\*Comportamento atual:\*\* Se os dados do usuário falharem na validação, o erro é retornado, mas o usuário já foi armazenado no banco de dados (modificando os dados do sistema em uma operação rejeitada).

\* \*\*Requisito relacionado:\*\* CA09 e RN08.



\---



\*\*Defeito 4\*\*



\* \*\*Localização:\*\* `src/users/user.service.js`, método `updateEmail`.

\* \*\*Descrição do problema:\*\* Para verificar se o novo e-mail já está em uso, o sistema busca apenas os primeiros 100 usuários (`await this.userRepository.findAll({ page: 0, size: 100 })`) em vez de buscar pelo e-mail específico.

\* \*\*Comportamento esperado:\*\* O sistema deve garantir a unicidade do e-mail verificando contra todos os usuários cadastrados.

\* \*\*Comportamento atual:\*\* O sistema permite atualizar o e-mail para um já existente, desde que o usuário que já possui esse e-mail não esteja retornado na primeira página de 100 registros.

\* \*\*Requisito relacionado:\*\* CA34.

