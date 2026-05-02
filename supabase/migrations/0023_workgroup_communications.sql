create table if not exists public.workgroup_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  content text not null,
  audience text not null check (audience in ('public', 'group', 'individual')),
  target_label text not null,
  channels text[] not null default array['in_app'],
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  sender_account_id uuid references public.accounts(id) on delete set null,
  sender_name text not null,
  related_module text not null default 'general',
  line_forwarding boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workgroup_message_recipients (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.workgroup_messages(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_account_id uuid references public.accounts(id) on delete set null,
  recipient_name text not null,
  role_label text not null,
  group_label text not null,
  line_user_id text,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  delivery_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.workgroup_message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.workgroup_messages(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_account_id uuid references public.accounts(id) on delete set null,
  author_name text not null,
  role_label text not null,
  content text not null,
  source text not null check (source in ('in_app', 'line')),
  line_event_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.line_channel_bindings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  line_user_id text not null,
  display_name text,
  status text not null default 'active',
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, line_user_id)
);

create index if not exists idx_workgroup_messages_workspace_status
  on public.workgroup_messages(workspace_id, status, published_at desc);

create index if not exists idx_workgroup_message_recipients_message
  on public.workgroup_message_recipients(message_id, read_at);

create index if not exists idx_workgroup_message_replies_message
  on public.workgroup_message_replies(message_id, created_at desc);

alter table public.workgroup_messages enable row level security;
alter table public.workgroup_message_recipients enable row level security;
alter table public.workgroup_message_replies enable row level security;
alter table public.line_channel_bindings enable row level security;

create policy "workspace members can read workgroup messages"
on public.workgroup_messages for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create workgroup messages"
on public.workgroup_messages for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read message recipients"
on public.workgroup_message_recipients for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage message recipients"
on public.workgroup_message_recipients for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can update own message read state"
on public.workgroup_message_recipients for update
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read message replies"
on public.workgroup_message_replies for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can create message replies"
on public.workgroup_message_replies for insert
with check (public.is_active_workspace_member(workspace_id));

create policy "workspace members can read line bindings"
on public.line_channel_bindings for select
using (public.is_active_workspace_member(workspace_id));

create policy "workspace members can manage own line binding"
on public.line_channel_bindings for all
using (public.is_active_workspace_member(workspace_id))
with check (public.is_active_workspace_member(workspace_id));
