drop type repeat;
create type repeat as enum ('daily', 'weekly', 'monthly', 'yearly');

drop table "event";
create table "event" (
	id integer primary key,
	insert_dttm timestamp not null default now(),
	name varchar(64) not null,
	first_date date not null,
	repeat repeat not null
);

--create table "event_email"

drop table "user";
create table "user" (
	id integer primary key,
	insert_dttm timestamp not null default now(),
	email varchar(128) not null,
	password varchar(64) not null,
	name varchar(64)
);


