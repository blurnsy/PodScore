from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from typing import Dict, Any, Optional, List
import sqlite3
import os
from pathlib import Path
from dotenv import load_dotenv
from .spotify_client import SpotifyClient
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get the absolute path to the database
db_path = str(Path(__file__).parent / "podcast_reviews.db")

# Initialize Spotify client
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
spotify_client = SpotifyClient(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)

class Database:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row

    def get_shows(self) -> list[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM shows ORDER BY name')
        shows = [dict(row) for row in cursor.fetchall()]
        for show in shows:
            if show['images']:
                show['images'] = json.loads(show['images'])
        return shows

    def get_show(self, show_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM shows WHERE id = ?', (show_id,))
        row = cursor.fetchone()
        if row:
            show = dict(row)
            if show['images']:
                show['images'] = json.loads(show['images'])
            return show
        return None

    def get_episodes(self, show_id: Optional[str] = None, limit: int = 100, offset: int = 0) -> list[Dict[str, Any]]:
        cursor = self.conn.cursor()
        if show_id:
            cursor.execute('''
            SELECT e.*, s.name as show_name 
            FROM episodes e
            JOIN shows s ON e.show_id = s.id
            WHERE e.show_id = ?
            ORDER BY e.release_date DESC
            LIMIT ? OFFSET ?
            ''', (show_id, limit, offset))
        else:
            cursor.execute('''
            SELECT e.*, s.name as show_name 
            FROM episodes e
            JOIN shows s ON e.show_id = s.id
            ORDER BY e.release_date DESC
            LIMIT ? OFFSET ?
            ''', (limit, offset))
        return [dict(row) for row in cursor.fetchall()]

    def get_episode(self, episode_id: str) -> Optional[Dict[str, Any]]:
        cursor = self.conn.cursor()
        cursor.execute('''
        SELECT e.*, s.name as show_name 
        FROM episodes e
        JOIN shows s ON e.show_id = s.id
        WHERE e.id = ?
        ''', (episode_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    def add_review(self, episode_id: str, rating: int, review: str) -> None:
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        
        cursor = self.conn.cursor()
        cursor.execute('''
        INSERT INTO reviews (episode_id, rating, review, timestamp)
        VALUES (?, ?, ?, ?)
        ''', (episode_id, rating, review, datetime.now().isoformat()))
        self.conn.commit()

    def get_reviews(self, show_id: Optional[str] = None, limit: Optional[int] = None) -> list[Dict[str, Any]]:
        cursor = self.conn.cursor()
        if show_id:
            query = '''
            SELECT r.*, e.name, e.release_date, e.image_url, s.name as show_name
            FROM reviews r
            JOIN episodes e ON r.episode_id = e.id
            JOIN shows s ON e.show_id = s.id
            WHERE e.show_id = ?
            ORDER BY r.timestamp DESC
            '''
            params = [show_id]
        else:
            query = '''
            SELECT r.*, e.name, e.release_date, e.image_url, s.name as show_name
            FROM reviews r
            JOIN episodes e ON r.episode_id = e.id
            JOIN shows s ON e.show_id = s.id
            ORDER BY r.timestamp DESC
            '''
            params = []
            
        if limit is not None:
            query += ' LIMIT ?'
            params.append(limit)
            
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]

    def search_reviews(self, query: str, show_id: Optional[str] = None) -> list[Dict[str, Any]]:
        cursor = self.conn.cursor()
        if show_id:
            cursor.execute('''
            SELECT r.*, e.name, e.release_date, s.name as show_name
            FROM reviews r
            JOIN episodes e ON r.episode_id = e.id
            JOIN shows s ON e.show_id = s.id
            WHERE (r.review LIKE ? OR e.name LIKE ?) AND e.show_id = ?
            ORDER BY r.timestamp DESC
            ''', (f'%{query}%', f'%{query}%', show_id))
        else:
            cursor.execute('''
            SELECT r.*, e.name, e.release_date, s.name as show_name
            FROM reviews r
            JOIN episodes e ON r.episode_id = e.id
            JOIN shows s ON e.show_id = s.id
            WHERE r.review LIKE ? OR e.name LIKE ? OR s.name LIKE ?
            ORDER BY r.timestamp DESC
            ''', (f'%{query}%', f'%{query}%', f'%{query}%'))
        return [dict(row) for row in cursor.fetchall()]

    def mark_as_listened(self, episode_id: str, listened_date: Optional[str] = None) -> None:
        cursor = self.conn.cursor()
        if listened_date is None:
            listened_date = datetime.now().date().isoformat()
        
        cursor.execute('''
        INSERT OR REPLACE INTO listening_history (episode_id, listened_date, timestamp)
        VALUES (?, ?, ?)
        ''', (episode_id, listened_date, datetime.now().isoformat()))
        self.conn.commit()

    def get_listening_history(self, show_id: Optional[str] = None, limit: int = 100) -> list[Dict[str, Any]]:
        cursor = self.conn.cursor()
        if show_id:
            cursor.execute('''
            SELECT h.*, e.name as episode_name, s.name as show_name
            FROM listening_history h
            JOIN episodes e ON h.episode_id = e.id
            JOIN shows s ON e.show_id = s.id
            WHERE e.show_id = ?
            ORDER BY h.listened_date DESC
            LIMIT ?
            ''', (show_id, limit))
        else:
            cursor.execute('''
            SELECT h.*, e.name as episode_name, s.name as show_name
            FROM listening_history h
            JOIN episodes e ON h.episode_id = e.id
            JOIN shows s ON e.show_id = s.id
            ORDER BY h.listened_date DESC
            LIMIT ?
            ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]

    def get_listening_stats(self) -> Dict[str, Any]:
        cursor = self.conn.cursor()
        
        # Get total episodes listened
        cursor.execute('SELECT COUNT(DISTINCT episode_id) FROM listening_history')
        total_episodes = cursor.fetchone()[0]
        
        # Get total shows with listened episodes
        cursor.execute('''
        SELECT COUNT(DISTINCT s.id)
        FROM shows s
        JOIN episodes e ON s.id = e.show_id
        JOIN listening_history h ON e.id = h.episode_id
        ''')
        total_shows = cursor.fetchone()[0]
        
        # Get episodes listened by month
        cursor.execute('''
        SELECT strftime('%Y-%m', listened_date) as month, COUNT(*) as count
        FROM listening_history
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
        ''')
        monthly_stats = [dict(row) for row in cursor.fetchall()]
        
        return {
            'total_episodes': total_episodes,
            'total_shows': total_shows,
            'monthly_stats': monthly_stats
        }

    def save_show(self, show: Dict[str, Any]) -> None:
        cursor = self.conn.cursor()
        cursor.execute('''
        INSERT OR REPLACE INTO shows (id, name, publisher, total_episodes, images)
        VALUES (?, ?, ?, ?, ?)
        ''', (
            show['id'],
            show['name'],
            show['publisher'],
            show['total_episodes'],
            json.dumps(show.get('images', []))
        ))
        self.conn.commit()

    def save_episodes(self, episodes: List[Dict[str, Any]], show_id: str) -> None:
        cursor = self.conn.cursor()
        for episode in episodes:
            cursor.execute('''
            INSERT OR REPLACE INTO episodes (
                id, show_id, name, description, release_date, 
                duration_ms, spotify_url, image_url
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                episode['id'],
                show_id,
                episode['name'],
                episode['description'],
                episode['release_date'],
                episode['duration_ms'],
                episode['external_urls']['spotify'],
                episode['images'][0]['url'] if episode['images'] else None
            ))
        self.conn.commit()

    def close(self) -> None:
        self.conn.close()

@app.route('/api/shows', methods=['GET'])
def get_shows():
    db = Database(db_path)
    try:
        shows = db.get_shows()
        return jsonify(shows)
    finally:
        db.close()

@app.route('/api/shows/<show_id>', methods=['GET'])
def get_show(show_id):
    db = Database(db_path)
    try:
        show = db.get_show(show_id)
        if show:
            return jsonify(show)
        return jsonify({'error': 'Show not found'}), 404
    finally:
        db.close()

@app.route('/api/episodes', methods=['GET'])
def get_episodes():
    show_id = request.args.get('show_id')
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    db = Database(db_path)
    try:
        episodes = db.get_episodes(show_id, limit, offset)
        return jsonify(episodes)
    finally:
        db.close()

@app.route('/api/episodes/<episode_id>', methods=['GET'])
def get_episode(episode_id):
    db = Database(db_path)
    try:
        episode = db.get_episode(episode_id)
        if episode:
            return jsonify(episode)
        return jsonify({'error': 'Episode not found'}), 404
    finally:
        db.close()

@app.route('/api/reviews', methods=['GET', 'POST'])
def handle_reviews():
    db = Database(db_path)
    try:
        if request.method == 'GET':
            show_id = request.args.get('show_id')
            limit = request.args.get('limit')
            if limit is not None:
                limit = int(limit)
            reviews = db.get_reviews(show_id, limit)
            return jsonify(reviews)
        else:  # POST
            data = request.json
            db.add_review(data['episode_id'], data['rating'], data['review'])
            return jsonify({'status': 'success'})
    finally:
        db.close()

@app.route('/api/reviews/search', methods=['GET'])
def search_reviews():
    query = request.args.get('q')
    show_id = request.args.get('show_id')
    
    db = Database(db_path)
    try:
        reviews = db.search_reviews(query, show_id)
        return jsonify(reviews)
    finally:
        db.close()

@app.route('/api/listening-history', methods=['GET', 'POST'])
def handle_listening_history():
    db = Database(db_path)
    try:
        if request.method == 'GET':
            show_id = request.args.get('show_id')
            limit = int(request.args.get('limit', 100))
            history = db.get_listening_history(show_id, limit)
            return jsonify(history)
        else:  # POST
            data = request.json
            db.mark_as_listened(data['episode_id'], data.get('listened_date'))
            return jsonify({'status': 'success'})
    finally:
        db.close()

@app.route('/api/stats', methods=['GET'])
def get_stats():
    db = Database(db_path)
    try:
        stats = db.get_listening_stats()
        return jsonify(stats)
    finally:
        db.close()

@app.route('/api/shows/search', methods=['GET'])
def search_shows():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    
    shows = spotify_client.search_podcast(query)
    return jsonify(shows)

@app.route('/api/shows/<show_id>/refresh', methods=['POST'])
def refresh_show(show_id):
    db = Database(db_path)
    try:
        # Get show details from Spotify
        show_details = spotify_client.get_show_details(show_id)
        
        # Save show details
        db.save_show({
            'id': show_id,
            'name': show_details['name'],
            'publisher': show_details['publisher'],
            'total_episodes': show_details['total_episodes'],
            'images': show_details.get('images', [])
        })
        
        # Fetch and save episodes
        episodes = spotify_client.get_podcast_episodes(show_id)
        db.save_episodes(episodes, show_id)
        
        return jsonify({'status': 'success', 'episodes_count': len(episodes)})
    finally:
        db.close()

@app.route('/api/shows', methods=['POST'])
def add_show():
    data = request.json
    show_id = data.get('show_id')
    if not show_id:
        return jsonify({'error': 'show_id is required'}), 400
    
    db = Database(db_path)
    try:
        # Check if show already exists
        existing_show = db.get_show(show_id)
        if existing_show:
            return jsonify({'status': 'exists', 'show': existing_show})
        
        # Get show details from Spotify
        show_details = spotify_client.get_show_details(show_id)
        
        # Save show details
        db.save_show({
            'id': show_id,
            'name': show_details['name'],
            'publisher': show_details['publisher'],
            'total_episodes': show_details['total_episodes'],
            'images': show_details.get('images', [])
        })
        
        # Fetch and save episodes
        episodes = spotify_client.get_podcast_episodes(show_id)
        db.save_episodes(episodes, show_id)
        
        return jsonify({
            'status': 'success',
            'show': show_details,
            'episodes_count': len(episodes)
        })
    finally:
        db.close()

if __name__ == '__main__':
    app.run(debug=True) 