from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

BASE_DIR = Path(__file__).resolve().parent
from app.api.v1.search import router as search_router

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

app.include_router(search_router, prefix="/api")

@app.get("/")
def main(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={},
    )


@app.get("/api/test")
def get_test() -> dict[str, str]:
    return {"message": "Hello from GET!"}


@app.post("/api/greet")
def greet(name: str) -> dict[str, str]:
    return {"message": f"Hello, {name}!"}
