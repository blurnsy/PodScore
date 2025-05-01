import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from typing import List, Dict, Any

class SpotifyClient:
    def __init__(self, client_id: str, client_secret: str):
        auth_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        self.spotify = spotipy.Spotify(auth_manager=auth_manager)
    
    def get_podcast_episodes(self, show_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch podcast episodes from Spotify for a given show ID.
        Will fetch all available episodes by making multiple API calls if necessary.
        """
        episodes = []
        offset = 0
        
        while True:
            results = self.spotify.show_episodes(show_id, limit=limit, offset=offset)
            batch = results['items']
            
            if not batch:
                break
                
            episodes.extend(batch)
            
            if len(batch) < limit:
                break
                
            offset += limit
        
        return episodes
    
    def search_podcast(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for podcasts by name and return multiple results"""
        results = self.spotify.search(q=query, type='show', limit=limit)
        
        if results and results['shows']['items']:
            return results['shows']['items']
        return []
    
    def get_show_details(self, show_id: str) -> Dict[str, Any]:
        """Get details about a podcast show"""
        return self.spotify.show(show_id) 