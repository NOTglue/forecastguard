from fastapi import APIRouter, Response
from ..services.region_service import region_service

router = APIRouter(prefix="/exports", tags=["Data Export"])


@router.get(
    "/regions.csv",
    summary="Export Regional Results as CSV",
    description="Download a structured CSV spreadsheet of all regional bust risks, precipitation deltas, and exceedance probabilities.",
    responses={
        200: {
            "content": {"text/csv": {}},
            "description": "Downloadable CSV file.",
        }
    }
)
def export_regions_csv() -> Response:
    csv_data = region_service.generate_regions_csv()
    filename = "forecastguard_regions.csv"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "text/csv; charset=utf-8",
    }
    return Response(content=csv_data, media_type="text/csv", headers=headers)
