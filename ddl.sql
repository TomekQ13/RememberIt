drop type repeat;
create type repeat as enum ('never', 'daily', 'weekly', 'monthly', 'yearly');

drop table "event";
create table "event" (
	id integer primary key generated always as identity,
    public_id varchar(64) not null,
	insert_dttm timestamp not null default now(),
    user_id integer not null,
	name varchar(64) not null,
    description varchar(1024),
	first_date date not null,
	repeat repeat not null
);

--create table "reminder"

drop table "user";
create table "user" (
	id integer primary key generated always as identity,
	insert_dttm timestamp not null default now(),
    update_dttm timestamp,
	email varchar(128) not null,
	password varchar(64) not null,
	name varchar(64)
);

drop table "reminder";
create table "reminder" (
	id integer primary key generated always as identity,
	insert_dttm timestamp not null default now(),
	update_dttm timestamp,
	event_id integer not null,
	remind_days_before integer not null,
	check (remind_days_before between 1 and 365)
);


