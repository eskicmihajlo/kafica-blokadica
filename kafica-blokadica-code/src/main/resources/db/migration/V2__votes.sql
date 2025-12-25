create table time_votes (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  time_option_id bigint not null references time_options(id) on delete cascade,
  vote varchar(10) not null, -- YES, MAYBE, NO
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, time_option_id)
);

create table place_votes (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  place_option_id bigint not null references place_options(id) on delete cascade,
  vote varchar(10) not null, -- LIKE, DISLIKE
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, place_option_id)
);
