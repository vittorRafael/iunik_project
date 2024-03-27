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
