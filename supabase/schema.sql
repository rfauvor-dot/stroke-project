-- Reclaim — Phase 1 schema (Supabase / PostgreSQL)

create table profiles (
  id uuid primary key references auth.users(id),
  role text not null check (role in ('patient','caregiver','clinician')),
  display_name text not null,
  -- patient fields
  aphasia_type text check (aphasia_type in ('fluent','non_fluent','unsure')),
  severity_self_report int check (severity_self_report between 1 and 4),
  session_target_min int not null default 10,
  link_code text unique,               -- patient generates; caregiver redeems
  linked_patient_id uuid references profiles(id),  -- set on caregiver rows
  created_at timestamptz not null default now()
);

create table word_sets (
  id serial primary key,
  name text not null,
  category text not null,
  sort_order int not null default 0
);

create table words (
  id serial primary key,
  set_id int not null references word_sets(id),
  word text not null,
  image_hint text,                     -- emoji or asset key for Phase 1
  category text not null,              -- semantic feature answers
  fn_use text not null,
  property text not null,
  location text not null,
  association text not null,
  sentence_frame text not null,        -- L1 cue: "You drink coffee from a ___"
  first_phoneme text not null,         -- L2 cue
  difficulty int not null default 1 check (difficulty between 1 and 3),
  is_personal boolean not null default false,
  owner_patient_id uuid references profiles(id)  -- null = library word
);

create table srs_state (
  patient_id uuid not null references profiles(id),
  word_id int not null references words(id),
  interval_days int not null default 1,
  due_date date not null default current_date,
  ease real not null default 2.0,
  reps int not null default 0,
  recent_outcomes int[] not null default '{}',   -- last 3 cue levels
  mastered boolean not null default false,       -- 3 consecutive L0-L1
  primary key (patient_id, word_id)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  planned_minutes int not null,
  end_state text check (end_state in ('flow','strain','fatigue','abandoned')),
  words_attempted int not null default 0,
  words_l0l1 int not null default 0,
  mean_latency_ms int,
  mean_cue_level real
);

create table attempts (
  id bigserial primary key,
  session_id uuid not null references sessions(id),
  patient_id uuid not null references profiles(id),
  word_id int not null references words(id),
  cue_level int not null check (cue_level between 0 and 4),
  latency_ms int,
  self_scored_success boolean not null,
  created_at timestamptz not null default now()
);

create table caregiver_checkins (
  id bigserial primary key,
  caregiver_id uuid not null references profiles(id),
  patient_id uuid not null references profiles(id),
  week_start date not null,
  q1_needs int not null check (q1_needs between 0 and 4),
  q2_conversation int not null check (q2_conversation between 0 and 4),
  q3_spontaneous_naming int not null check (q3_spontaneous_naming between 0 and 4),
  q4_phone_greeting int not null check (q4_phone_greeting between 0 and 4),
  q5_frustration_rev int not null check (q5_frustration_rev between 0 and 4),
  notes text,
  unique (patient_id, week_start)
);

create table alerts (
  id bigserial primary key,
  patient_id uuid not null references profiles(id),
  kind text not null check (kind in ('inactive_3d')),
  created_at timestamptz not null default now(),
  acknowledged boolean not null default false
);

-- RLS
alter table profiles enable row level security;
alter table srs_state enable row level security;
alter table sessions enable row level security;
alter table attempts enable row level security;
alter table caregiver_checkins enable row level security;
alter table alerts enable row level security;

create policy own_profile on profiles for all using (id = auth.uid());
create policy patient_own on srs_state for all using (patient_id = auth.uid());
create policy patient_sessions on sessions for all using (patient_id = auth.uid());
create policy caregiver_sessions on sessions for select using (
  exists (select 1 from profiles c where c.id = auth.uid()
          and c.role = 'caregiver' and c.linked_patient_id = sessions.patient_id));
create policy patient_attempts on attempts for all using (patient_id = auth.uid());
create policy caregiver_attempts on attempts for select using (
  exists (select 1 from profiles c where c.id = auth.uid()
          and c.role = 'caregiver' and c.linked_patient_id = attempts.patient_id));
create policy checkin_rw on caregiver_checkins for all using (caregiver_id = auth.uid());
create policy alerts_caregiver on alerts for select using (
  exists (select 1 from profiles c where c.id = auth.uid()
          and c.role = 'caregiver' and c.linked_patient_id = alerts.patient_id));
