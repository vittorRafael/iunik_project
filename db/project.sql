create table cargos (
	id serial primary key,
  funcao text not null
);

create table usuarios (
  id serial primary key,
  nome text not null, 
  sobrenome text, 
  email text unique not null, 
  senha text not null, 
  senhaResetToken text null,
  senhaResetTempo text null,
  cargo_id int not null references cargos(id)
)







