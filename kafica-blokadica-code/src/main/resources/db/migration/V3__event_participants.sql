create table event_participants (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index idx_event_participants_event_id on event_participants(event_id);
create index idx_event_participants_user_id on event_participants(user_id);