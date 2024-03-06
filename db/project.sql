create database charger;

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
  cargo_id int not null references cargos(id)
);






