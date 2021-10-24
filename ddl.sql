--drop type repeat;
create type repeat as enum ('never', 'daily', 'weekly', 'monthly', 'yearly');

--drop table "user";
create table "user" (
	id integer primary key generated always as identity,
	insert_dttm timestamp not null default now(),
    update_dttm timestamp,
	email varchar(128) not null,
	password varchar(64) not null,
	name varchar(64)
);

--drop table "event";
create table "event" (
	id integer generated always as identity,
    public_id varchar(64) not null primary key,
	insert_dttm timestamp not null default now(),
    update_dttm timestamp,
    user_id integer not null,
	name varchar(64) not null,
    description varchar(1024),
	first_date date not null,
	repeat repeat not null,
    constraint fk_event_user foreign key(user_id) references "user"(id) on delete cascade
);

--drop table "reminder";
create table "reminder" (
	id integer primary key generated always as identity,
	insert_dttm timestamp not null default now(),
	update_dttm timestamp,
	event_public_id varchar(64) not null,
	remind_days_before integer not null,
	check (remind_days_before between 1 and 365),
    constraint fk_reminder_event foreign key(event_public_id) references event(public_id) on delete cascade
);

--drop table occurence;
create table occurence (
	id integer primary key generated always as identity,
	public_id varchar(64) not null,
    user_id integer not null,
	name varchar(64) not null,
    description varchar(1024),
	date date not null,
	repeat repeat not null,
	remind_days_before integer not null,
	reminder_date date not null,
	email varchar(128) not null,
	sent_dttm timestamp
);

CREATE OR REPLACE PROCEDURE insert_occurences(period_days integer)
LANGUAGE SQL
AS $$
with recursive monthly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'monthly'
	and e.first_date <= current_date + interval '1 day' * period_days
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 month') as date, e.repeat
	from "monthly_occurence" e
	where e.date + interval '1 month' <= current_date + interval '1 day' * period_days
), weekly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'weekly'
	and e.first_date <= current_date + interval '1 day' * period_days
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 week') as date, e.repeat
	from "weekly_occurence" e
	where e.date + interval '1 week' <= current_date + interval '1 day' * period_days
), daily_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'daily'
	and e.first_date <= current_date + interval '1 day' * period_days
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 day') as date, e.repeat
	from "daily_occurence" e
	where e.date + interval '1 day' <= current_date + interval '1 day' * period_days
), yearly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'yearly'
	and e.first_date <= current_date + interval '1 day' * period_days
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 year') as date, e.repeat
	from "yearly_occurence" e
	where e.date + interval '1 year' <= current_date + interval '1 day' * period_days
)
	insert into occurence(public_id, user_id, name, description, date, repeat, remind_days_before, reminder_date, email, type, phone)
	select e.public_id,
	e.user_id,
	e.name,
	e.description,
	e.date,
	e.repeat,
	r.remind_days_before,
	e.date - r.remind_days_before as reminder_date,
	u.email,
	r.type as type,
	u.phone as phone from (
		select *
		from yearly_occurence
		union all
		select *
		from monthly_occurence
		union all
		select *
		from weekly_occurence
		union all
		select *
		from daily_occurence
	) e left join reminder r
		on e.public_id = r.event_public_id
		left join "user" u
		on e.user_id = u.id		
 		where e.date - r.remind_days_before >= current_date
		and not exists (
			select 1
			from occurence o
			where
				e.date - r.remind_days_before = o.reminder_date
				and  e.public_id = o.public_id
		)
;
$$;
--drop view next_year_occurences;
create or replace view next_year_occurences as 
with recursive monthly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as event_date, e.repeat
	from "event" e
	where e.repeat = 'monthly'
 	and e.first_date <= current_date + interval '1 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.event_date + interval '1 month') as event_date, e.repeat
	from "monthly_occurence" e
 	where e.event_date + interval '1 month' <= current_date + interval '1 year'
), weekly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as event_date, e.repeat
	from "event" e
	where e.repeat = 'weekly'
 	and e.first_date <= current_date + interval '1 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.event_date + interval '1 week') as event_date, e.repeat
	from "weekly_occurence" e
 	where e.event_date + interval '1 week' <= current_date + interval '1 year'
), daily_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as event_date, e.repeat
	from "event" e
	where e.repeat = 'daily'
 	and e.first_date <= current_date + interval '1 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.event_date + interval '1 day') as event_date, e.repeat
	from "daily_occurence" e
 	where e.event_date + interval '1 day' <= current_date + interval '1 year'
), yearly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as event_date, e.repeat
	from "event" e
	where e.repeat = 'yearly'
 	and e.first_date <= current_date + interval '1 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.event_date + interval '1 year') as event_date, e.repeat
	from "yearly_occurence" e
 	where e.event_date + interval '1 year' <= current_date + interval '1 year'
)
	select *
	from yearly_occurence
	union all
	select *
	from monthly_occurence
	union all
	select *
	from weekly_occurence
	union all
	select *
	from daily_occurence
	union all
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as event_date, e.repeat
	from "event" e
	where e.repeat = 'never';


create type reminder_type as enum ('sms', 'email');

alter table reminder
add column type reminder_type not null default 'email';

alter table reminder
alter column type drop default;

alter table occurence
add column type reminder_type not null default 'email';

alter table occurence
alter column type drop default;

alter table "user"
add column phone varchar(32);

alter table occurence
add column phone varchar(32);

--drop table "token";
create table "token" (
	id integer primary key generated always as identity,
	user_id integer not null,
	token_value varchar(64) not null,
	valid_to_dttm timestamp not null,
	insert_dttm timestamp not null default now(),
	constraint fk_token_user foreign key(user_id) references "user"(id) on delete cascade
	
);

create index index_token_token_value on "token" (token_value);

alter table "user"
add column premium_valid_to timestamp;

alter table "user"
add column stripe_customer_id varchar(64);

create index index_user_id on "user" ("id");
drop index index_user_id;

alter table "user"
add column reset_password_token varchar(64);

alter table "user"
add column reset_password_token_dttm timestamp;