from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import elevators

app = FastAPI(
    title="SafeMetro 부산 API",
    description="부산교통공사 엘리베이터 대체경로 공공데이터 프록시",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(elevators.router)


@app.get("/")
async def root():
    return {
        "service": "SafeMetro 부산",
        "docs": "/docs",
        "elevators": "/api/v1/elevators?all=true",
    }
