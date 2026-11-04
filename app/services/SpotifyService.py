# app/services/spotify_service.py
from typing import Any, Dict, List, Optional
import httpx

class SpotifyService:
    def __init__(self, client: Optional[httpx.AsyncClient] = None):
        self.client = client or httpx.AsyncClient()

    async def search_tracks(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        # Replace with Spotify token retrieval / headers
        headers = await self._get_auth_headers()
        params = {
            "q": query,
            "type": "track",
            "limit": limit
        }

        try:
            response = await self.client.get(
                "https://api.spotify.com/v1/search",
                headers=headers,
                params=params,
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
        except Exception as exc:
            raise RuntimeError("Spotify upstream failure") from exc

        raw_items = data.get("tracks", {}).get("items", [])
        results = []
        for item in raw_items:
            images = item.get("album", {}).get("images", [])
            image_url = images[0]["url"] if images else None
            
            # Format artists as a single display string
            artists = ", ".join(a.get("name", "") for a in item.get("artists", []))

            results.append({
                "id": item.get("id"),
                "type": item.get("type", "track"),
                "title": item.get("name"),
                "artist": artists,
                "image_url": image_url,
                "spotify_uri": item.get("uri"),
                "spotify_url": item.get("external_urls", {}).get("spotify"),
            })
        return results

    async def _get_auth_headers(self) -> Dict[str, str]:
        # Implement or hook into your existing token retrieval from #3
        return {"Authorization": "Bearer YOUR_TOKEN"}