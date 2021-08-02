drop type repeat;
create type repeat as enum ('never', 'daily', 'weekly', 'monthly', 'yearly');

drop table "user";
create table "user" (
	id integer primary key generated always as identity,
	insert_dttm timestamp not null default now(),
    update_dttm timestamp,
	email varchar(128) not null,
	password varchar(64) not null,
	name varchar(64)
);

drop table "event";
create table "event" (
	id integer primary key generated always as identity,
    public_id varchar(64) not null,
	insert_dttm timestamp not null default now(),
    update_dttm timestamp,
    user_id integer not null,
	name varchar(64) not null,
    description varchar(1024),
	first_date date not null,
	repeat repeat not null,
    constraint fk_event_user foreign key(user_id) references user(id) on delete cascade
);

drop table "reminder";
create table "reminder" (
	id integer primary key generated always as identity,
	insert_dttm timestamp not null default now(),
	update_dttm timestamp,
	event_id integer not null,
	remind_days_before integer not null,
	check (remind_days_before between 1 and 365),
    constraint fk_reminder_event foreign key(event_id) references event(customer_id) on delete cascade
);

create materialized view "occurence" as (
	select e.id as event_id, e.public_id as event_public_id, user_id, first_date, repeat, r.remind_days_before,
		first_date - 
	from event e
	left join reminder r
	on e.public_id = r.event_public_id
	
	

);
select * from occurence;