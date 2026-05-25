import httpx

from app.config import settings

PER_PAGE = 500


async def fetch_page(client: httpx.AsyncClient, page: int, per_page: int) -> dict:
    if not settings.odcloud_service_key:
        raise ValueError("ODCLOUD_SERVICE_KEY is not configured")

    url = f"{settings.odcloud_api_base.rstrip('/')}{settings.odcloud_dataset_path}"
    params = {
        "page": page,
        "perPage": per_page,
        "serviceKey": settings.odcloud_service_key,
    }

    response = await client.get(url, params=params, timeout=30.0)
    response.raise_for_status()
    return response.json()


async def fetch_all_elevator_records() -> dict:
    async with httpx.AsyncClient() as client:
        first = await fetch_page(client, 1, PER_PAGE)
        data = list(first.get("data", []))
        total = int(first.get("totalCount", len(data)))
        total_pages = max(1, (total + PER_PAGE - 1) // PER_PAGE)

        for page in range(2, total_pages + 1):
            batch = await fetch_page(client, page, PER_PAGE)
            data.extend(batch.get("data", []))

        return {
            "page": 1,
            "perPage": len(data),
            "totalCount": total,
            "currentCount": len(data),
            "matchCount": first.get("matchCount", total),
            "data": data,
            "source": "odcloud",
        }
