create table if not exists match_decisions (
  source_id        text not null,
  bam_id           text not null,
  status           text not null check (status in ('confirmed', 'rejected')),
  candidate_row_id text,
  manual_match     jsonb,
  updated_at       timestamptz not null default now(),
  primary key (source_id, bam_id)
);

create index if not exists match_decisions_updated_at_idx
  on match_decisions (updated_at desc);
