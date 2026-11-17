Encontrei \*\*4 defeitos funcionais\*\* introduzidos pelo PR.



\### 1. Cadastro permite e-mail duplicado



\*\*Localização:\*\* `src/users/user.service.js`, método `createUser`, na verificação:



```js

if (existingUser \&\& existingUser.id === input.id) {

&#x20; throw new AppError("EMAIL\_ALREADY\_EXISTS", 409);

}

```



\*\*Descrição do problema:\*\* a condição só rejeita o cadastro quando o usuário encontrado pelo e-mail possui o mesmo `id` recebido em `input.id`. Em um cadastro normal, `input.id` não existe, enquanto `existingUser.id` é numérico. Assim, um e-mail já cadastrado normalmente não é rejeitado.



\*\*Comportamento esperado:\*\* se `findByEmail(email)` retornar qualquer usuário existente, o novo cadastro deve ser rejeitado.



\*\*Comportamento atual:\*\* um segundo usuário pode ser criado com o mesmo e-mail.



\*\*Requisito relacionado:\*\* \*\*CA07\*\* — o e-mail deve ser obrigatório e único.



\---



\### 2. Cadastro aceita nome vazio ou e-mail inválido quando apenas um deles está incorreto



\*\*Localização:\*\* `src/users/user.service.js`, método `createUser`:



```js

if (isBlank(name) \&\& !isValidEmail(email)) {

&#x20; throw new AppError("INVALID\_USER");

}

```



\*\*Descrição do problema:\*\* foi usado `\&\&`, portanto a operação só é rejeitada quando \*\*nome e e-mail são inválidos simultaneamente\*\*.



Por exemplo, ambos estes cadastros são aceitos:



```js

{ name: "", email: "user@example.com" }

```



```js

{ name: "User", email: "invalid-email" }

```



\*\*Comportamento esperado:\*\* o cadastro deve ser rejeitado se o nome estiver vazio \*\*ou\*\* se o e-mail for inválido.



\*\*Comportamento atual:\*\* quando somente um dos campos é inválido, o usuário é cadastrado normalmente.



\*\*Requisito relacionado:\*\* \*\*CA08\*\* — nome vazio ou e-mail inválido deve causar a rejeição do cadastro. Também afeta \*\*CA07\*\* quando o e-mail está ausente, pois `undefined` é inválido e pode ser aceito se o nome for válido.



\---



\### 3. Usuário é persistido antes da validação do cadastro



\*\*Localização:\*\* `src/users/user.service.js`, método `createUser`:



```js

const user = await this.userRepository.save({ name, email });



if (isBlank(name) \&\& !isValidEmail(email)) {

&#x20; throw new AppError("INVALID\_USER");

}

```



\*\*Descrição do problema:\*\* a chamada a `save` ocorre antes da validação. Quando nome e e-mail são ambos inválidos, a API lança erro, mas o usuário já foi inserido no repositório.



Exemplo:



```js

POST /users

{

&#x20; "name": "",

&#x20; "email": "invalid"

}

```



A requisição é rejeitada, porém o registro permanece em `#users`.



\*\*Comportamento esperado:\*\* todas as validações devem ocorrer antes de qualquer alteração persistente. Uma tentativa rejeitada não pode deixar um usuário criado.



\*\*Comportamento atual:\*\* a requisição retorna erro, mas cria parcialmente o usuário no sistema.



\*\*Requisitos relacionados:\*\* \*\*CA09\*\* — tentativa inválida não deve criar parcialmente o usuário; \*\*RN08\*\* — uma operação rejeitada não pode modificar os dados do sistema.



\---



\### 4. Atualização de e-mail não garante unicidade quando há mais de 100 usuários



\*\*Localização:\*\* `src/users/user.service.js`, método `updateEmail`:



```js

const users = await this.userRepository.findAll({ page: 0, size: 100 });



const emailInUse = users.some(

&#x20; (other) => other.email === email \&\& other.id !== user.id

);

```



\*\*Descrição do problema:\*\* a verificação de unicidade consulta somente os primeiros 100 usuários. Se o proprietário do e-mail estiver a partir do 101º registro, ele não será encontrado.



Por exemplo, com 101+ usuários, se o usuário de ID 1 tentar mudar seu e-mail para o e-mail pertencente ao usuário de ID 101, a verificação pode considerar o endereço disponível.



\*\*Comportamento esperado:\*\* a unicidade deve ser verificada contra \*\*todos\*\* os usuários, independentemente da paginação. O próprio `findByEmail(email)` já permitiria fazer essa verificação diretamente.



\*\*Comportamento atual:\*\* e-mails pertencentes a usuários fora dos primeiros 100 registros podem ser atribuídos a outro usuário, criando duplicidade.



\*\*Requisito relacionado:\*\* \*\*CA34\*\* — o novo e-mail não pode pertencer a outro usuário.

