alter table event_participants
  add column responded_at timestamptz;

create index if not exists idx_event_participants_responded_at
  on event_participants(event_id, responded_at);
