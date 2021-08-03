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

drop materialized view occurence;	
create materialized view occurence as (
with recursive monthly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'monthly'
	and e.first_date >= now()
	and e.first_date < now() + interval '2 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 month') as date, e.repeat
	from "monthly_occurence" e
	where e.date + interval '1 month' < now() + interval '2 year'
), weekly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'weekly'
	and e.first_date >= now()
	and e.first_date < now() + interval '2 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 week') as date, e.repeat
	from "weekly_occurence" e
	where e.date + interval '1 week' < now() + interval '2 year'
), daily_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'daily'
	and e.first_date >= now()
	and e.first_date < now() + interval '2 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 day') as date, e.repeat
	from "daily_occurence" e
	where e.date + interval '1 day' < now() + interval '2 year'
), yearly_occurence as (
	select e.id, e.public_id, e.name, e.description, e.user_id, e.first_date as date, e.repeat
	from "event" e
	where e.repeat = 'yearly'
	and e.first_date >= now()
	and e.first_date < now() + interval '2 year'
	union
	select e.id, e.public_id, e.name, e.description, e.user_id, date(e.date + interval '1 year') as date, e.repeat
	from "yearly_occurence" e
	where e.date + interval '1 year' < now() + interval '2 year'
)
	select e.*, r.remind_days_before, e.date - r.remind_days_before as reminder_date from (
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
		order by reminder_date
);
	


select * from occurence;
	
	
	