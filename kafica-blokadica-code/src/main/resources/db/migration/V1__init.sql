create table users (
  id bigserial primary key,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  display_name varchar(100) not null,
  created_at timestamptz not null default now()
);

create table events (
  id bigserial primary key,
  title varchar(140) not null,
  description text,
  deadline timestamptz not null,
  status varchar(20) not null, -- OPEN, FINALIZED, CANCELLED
  creator_user_id bigint not null references users(id),
  invite_token varchar(64) not null unique,
  created_at timestamptz not null default now()
);

create table time_options (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table place_options (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  name varchar(140) not null,
  address varchar(255),
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);
