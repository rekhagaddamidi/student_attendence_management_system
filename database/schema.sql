-- Student Attendance Management System
-- Run this script in your Supabase project's SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null check (char_length(trim(name)) > 0),
  roll_number varchar(30) not null unique check (char_length(trim(roll_number)) > 0),
  course varchar(80) not null check (char_length(trim(course)) > 0),
  email varchar(254),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  attendance_date date not null,
  status varchar(10) not null check (status in ('present','absent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint one_attendance_per_student_per_day unique (student_id, attendance_date)
);

create index if not exists idx_attendance_date on public.attendance(attendance_date);
create index if not exists idx_attendance_student on public.attendance(student_id);

create or replace function public.set_attendance_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists attendance_updated_at on public.attendance;
create trigger attendance_updated_at
before update on public.attendance
for each row execute function public.set_attendance_updated_at();

-- This starter uses the server-side Supabase key from backend/.env.
-- Do not expose that key to browsers or GitHub. The app performs its own
-- server-side validation; RLS is enabled so browser clients cannot access
-- these tables by default. If you later add Supabase Auth, create policies
-- based on verified user identity and role.
alter table public.students enable row level security;
alter table public.attendance enable row level security;
