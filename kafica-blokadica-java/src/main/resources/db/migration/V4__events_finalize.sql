alter table events
  add column final_time_option_id bigint references time_options(id),
  add column final_place_option_id bigint references place_options(id),
  add column finalized_at timestamptz;

create index if not exists idx_events_final_time_option_id on events(final_time_option_id);
create index if not exists idx_events_final_place_option_id on events(final_place_option_id);
