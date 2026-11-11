
from fastapi import APIRouter, HTTPException, Query, status
from app.services.spotify_service import spotify_service

router = APIRouter()
spotify_service = spotify_service()

@router.get("/search")
async def search(
    q: str = Query(..., description="Search query"),
    type: str = Query("track", description="Search type (only 'track' is supported)")
):
    trimmed_query = q.strip()
    
    # Missing or blank queries
    if not trimmed_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'q' cannot be empty."
        )
    
    # Unsupported types
    if type != "track":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported search type. Only 'track' is supported."
        )

    try:
        results = await spotify_service.search_tracks(trimmed_query, limit=5)
        return {"results": results}
    except Exception:
        # Spotify failures return 503 with safe detail
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Search service temporarily unavailable."
        )


#router = APIRouter()

#@router.get("/search")
#async def search_tracks():
    #response = Query("https://api.spotify.com/v1/search?q=track%3A{INPUT}&type=track&market=US&limit=5&offset=0 \
  #Authorization: {APIKEY}")
    #return response;
