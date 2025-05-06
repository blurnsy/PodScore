create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  email text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table shows (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  publisher text,
  total_episodes integer,
  images text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table episodes (
  id uuid default uuid_generate_v4() primary key,
  show_id uuid references shows(id) on delete cascade not null,
  name text not null,
  description text,
  release_date timestamp with time zone,
  duration_ms integer,
  spotify_url text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table reviews (
  id uuid default uuid_generate_v4() primary key,
  episode_id uuid references episodes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table listening_history (
  id uuid default uuid_generate_v4() primary key,
  episode_id uuid references episodes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  listened_date timestamp with time zone not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table comments (
  id uuid default uuid_generate_v4() primary key,
  review_id uuid references reviews(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table shows enable row level security;
alter table episodes enable row level security;
alter table reviews enable row level security;
alter table listening_history enable row level security;
alter table comments enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Shows are public
create policy "Shows are viewable by everyone"
  on shows for select
  using (true);

-- Episodes are public
create policy "Episodes are viewable by everyone"
  on episodes for select
  using (true);

-- Reviews
create policy "Reviews are viewable by everyone"
  on reviews for select
  using (true);

create policy "Users can create reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete
  using (auth.uid() = user_id);

-- Comments
create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Users can create comments"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on comments for delete
  using (auth.uid() = user_id);

-- Listening history
create policy "Users can view own listening history"
  on listening_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own listening history"
  on listening_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own listening history"
  on listening_history for update
  using (auth.uid() = user_id); 