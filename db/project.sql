create table cargos (
	id serial primary key,
  funcao text not null
);

create table usuarios (
  id serial primary key,
  nome text not null,
  email text unique not null, 
  cpf text unique not null,
  rua text null,
  bairro text null,
  cep text null,
  cidade text null,
  estado text null,
  senha text not null, 
  senhaResetToken text null,
  senhaResetTempo text null,
  agencia text null,
  conta text null,
  pix text null,
 	srcPerfil text null,
  srcCert text null,
  inativo boolean default false,
  cargo_id int not null references cargos(id)
);

create table formaspagamento (
	id serial primary key,
  forma text not null
);

create table pedidos (
	id serial primary key,
  dataPedido text not null,
  valor decimal not null,
  valorConsult decimal not null,
  consultPago boolean default false,
  saldodisp boolean default false,
  produtos_ids int array not null,
  formapag_id int not null references formaspagamento(id),
  consultor_id int not null references usuarios(id),
  cliente_id int not null references usuarios(id)
);

create table saques (
	id serial primary key,
  dataSaque text not null,
  valorSaque decimal not null,
  status text default 'pendente',
  srcComp text null,
  pedidos_ids int array not null
);

create table produtos (
	id serial primary key,
  nome text not null,
  descricao text not null,
  valorMin decimal not null,
  valorMax decimal not null,
  valorVenda decimal not null,
  inativo boolean default false,
  mediaAvs decimal null default 0.0
);

create table consultor_produtos(
  id serial primary key,
  produto_id int not null references produtos(id),
  consultor_id int not null references usuarios(id),
  valorConsult decimal not null,
  valorTotal decimal not null
);

create table avaliacoes (
	id serial primary key,
  comentario text not null,
  produto_id int not null references produtos(id)
);





