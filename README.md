# Manual para api - Sistema de controle de fluxo

## Rotas para Cargos:

### - Listar Cargos

- Parâmetro Get - http://localhost:3000/cargos

- Retorno - Lista json com os cargos cadastrados.

### - Adicionar Novo Cargo

- Parâmetro Post - http://localhost:3000/cargos

- Corpo da requisição em Json
ex: {
	"funcao": "Admin"
}

- Retorno - Mensagem de sucesso ou erro em json.

### - Remover Cargo

- Parâmetro Delete - http://localhost:3000/cargos/:id

- Em :id colocar id do cargo que irá ser removido.
ex: http://localhost:3000/cargos/1

- Retorno - Mensagem de sucesso ou erro em json.

## Rotas para Usuários:

### - Cadastrar Usuário

- Parâmetro Post - http://localhost:3000/usuarios

- Corpo da requisição em Json
ex: {
	"nome*": "Teste Usuario",
	"cpf*": "000.000.000-00",
	"email*": "teste@gmail.com",
	"rua": "Rua 1 de maio",
	"bairro": "triangulo",
	"estado": "CE",
	"cep": "62875000",
	"cidade": "Chorozinho",
	"agencia": "4554-3",
	"conta": "32290-3",
	"pix": "85994344661",
	"senha*": "teste123",
	"cargo_id*": 4
}

- Campos com * são obrigatórios para criação do usuário.

- Em cargo_id deve ser passado o id do registro da tabela **cargos**

- Retorno - Mensagem de sucesso ou erro em json.

### - Listar Usuários

- Parâmetro Get - http://localhost:3000/usuarios/:id

- Em :id colocar id do usuário que quer ser detalhado, caso queira todos os registros passar "0".
ex: http://localhost:3000/usuarios/0

- Retorno - Lista json com os usuários cadastrados.

### - Obter Perfil

- Parâmetro Get - http://localhost:3000/perfil

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Todas informações relacionadas ao perfil do usuário logado.

### - Editar Perfil

- Parâmetro Patch - http://localhost:3000/perfil

- Corpo da requisição em Json.
ex: {
    "nome": "Teste Editar"
}

- Pode editar todos os campos iguais ao do cadastro, de uma vez ou um por vez, respeitando sempre que email e cpf tem que ser unicos para o usuário.

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Mensagem de sucesso ou erro em json.

### - Deletar Perfil

- Parâmetro Delete - http://localhost:3000/perfil

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Mensagem de sucesso ou erro em json.


### - Adicionar Foto do Perfil

- Parâmetro Post - http://localhost:3000/perfil/foto

- Corpo da requisição multipart form passando um input do tipo "file" com name "file".

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Mensagem de sucesso ou erro em json.


### - Adicionar Certificado do Perfil

- Parâmetro Post - http://localhost:3000/perfil/certificado

- Corpo da requisição multipart form passando um input do tipo "file" com name "file".

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Mensagem de sucesso ou erro em json.


### - Remover Foto do Perfil

- Parâmetro Delete - http://localhost:3000/perfil/foto

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Mensagem de sucesso ou erro em json.

### - Remover Certificado do Perfil

- Parâmetro Delete - http://localhost:3000/perfil/foto

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Mensagem de sucesso ou erro em json.


## Rotas de Login:

### - Entrar

- Parâmetro Post - http://localhost:3000/login
- Corpo da requisição em json.
ex: {
    "email": "teste@gmail.com",
	"senha": "teste123"
}

- Retorno - Um objeto com os dados do usuário logado e o token de autenticação.

### - Esqueci senha

- Parâmetro Post - http://localhost:3000/esqueceu_senha
- Corpo da requisição em json.
ex: {
    "email": "teste@gmail.com",
}

- Um email irá ser enviado com um token para recuperar a senha. Após ter chegado o token, acesse a rota [Alterar Senha](#--Alterar-senha)

- Retorno - Mensagem de sucesso ou erro em json.



### - Alterar senha

- Parâmetro Post - http://localhost:3000/alterar_senha
- Corpo da requisição em json
ex: {
	"email": "teste.com",
	"token": "7485819679df159db2dede4b6a70d0a60575e018",
	"senha": "teste123"
}

- Se o token estiver correto e não expirado a senha irá ser alterada.
- Retorno - Mensagem de sucesso ou erro em json.


## Rotas para Consultores: 

### - Listar Consultores

- Parâmetro Get - http://localhost:3000/consultores/:id

- Em :id colocar id do consultor que quer ser detalhado, caso queira todos os registros passar "0".
ex: http://localhost:3000/consultores/0

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Lista json com os usuários com cargo de consultor cadastrados.

### - Bloquear Consultor

- Parâmetro Patch - http://localhost:3000/consultores/:id
- Em :id colocar id do consultor que irá ser bloqueado.
ex: http://localhost:3000/consultores/1

- Enviar Auth Bearer Token na requisição passando o token de login.
- Retorno - Mensagem de sucesso ou erro em json.


## Rotas para Produtos:

### - Listar Produtos

- Parâmetro Get - http://localhost:3000/produtos/:id

- Em :id colocar id do produto que quer ser detalhado, caso queira todos os registros passar "0".
ex: http://localhost:3000/produtos/0

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Lista json com os registros da tabela produtos.

### - Adicionar Produto

- Parâmetro Post - http://localhost:3000/produtos
- Corpo da requisição em json
ex: {
	"nome": "Teste",
	"descricao": "Descrição Teste",
	"valorprod": 1000,
	"valormin": 200,
	"valormax": 400
}
- Enviar Auth Bearer Token na requisição passando o token de login.
- O valor do consultor irá sempre começar no valor mínimo, para alterá-lo acesse [Valor consultor](#--Valor-Consultor-Produto).
- Retorno - Mensagem de sucesso ou erro em json.

### - Editar Produto

- Parâmetro Post - http://localhost:3000/produtos/:id
- Em :id colocar id do produto que irá ser alterado.
ex: http://localhost:3000/produtos/1
- Corpo da requisição em json
ex: {
	"nome": "Teste",
	"descricao": "Descrição Teste",
	"valorprod": 1000,
	"valormin": 200,
	"valormax": 400
}
- Enviar Auth Bearer Token na requisição passando o token de login.
- Pode editar todos os campos iguais ao do cadastro, de uma vez ou um por vez.
- Retorno - Mensagem de sucesso ou erro em json.


### - Valor Consultor Produto

- Parâmetro Patch - http://localhost:3000/produtos/:id/valorconsult
- Em :id colocar id do produto que irá ser alterado.
ex: http://localhost:3000/produtos/1/valorconsult

- Corpo da requisição em json.
ex: {
	"valorconsult": 610.90
}

- Enviar Auth Bearer Token na requisição passando o token de login.

- Retorno - Mensagem de sucesso ou erro em json.

### - Deletar Produto

- Parâmetro Delete - http://localhost:3000/produtos/:id

- Em :id colocar id do produto que irá ser removido.
ex: http://localhost:3000/produtos/1

- Retorno - Mensagem de sucesso ou erro em json.
