from fastapi import APIRouter, HTTPException, Query

from app.services.odcloud import fetch_all_elevator_records, fetch_page
import httpx

router = APIRouter(prefix="/api/v1", tags=["elevators"])


@router.get("/elevators")
async def get_elevators(
    page: int = Query(1, ge=1),
    per_page: int = Query(500, ge=1, le=1000),
    all: bool = Query(False, alias="all"),
):
    """공공데이터 엘리베이터·대체경로 조회 (한글 필드명 원본)"""
    try:
        if all:
            return await fetch_all_elevator_records()

        async with httpx.AsyncClient() as client:
            return await fetch_page(client, page, per_page)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"ODcloud API error: {exc.response.text[:200]}",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/health")
async def health():
    return {"status": "ok", "service": "SafeMetro Busan API"}
