alter table match_decisions
  add column if not exists original_score integer,
  add column if not exists correction_status text
    check (correction_status in ('pending', 'corrected')),
  add column if not exists corrected_at timestamptz;

