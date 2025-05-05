CREATE TABLE IF NOT EXISTS shows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    publisher TEXT,
    total_episodes INTEGER,
    images TEXT
);

CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    show_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    release_date TEXT,
    duration_ms INTEGER,
    spotify_url TEXT,
    image_url TEXT,
    FOREIGN KEY (show_id) REFERENCES shows(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (episode_id) REFERENCES episodes(id)
);

CREATE TABLE IF NOT EXISTS listening_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id TEXT NOT NULL,
    listened_date TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (episode_id) REFERENCES episodes(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (review_id) REFERENCES reviews(id)
); 