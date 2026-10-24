from fastapi import APIRouter, HTTPException, status
from ..schemas.region import (
    Region,
    RegionsListResponse,
    RegionRisk,
    RegionExplanation,
)
from ..services.region_service import region_service

router = APIRouter(prefix="/regions", tags=["Regions & Bust Risk"])


@router.get(
    "",
    response_model=RegionsListResponse,
    summary="List Monitored Regions",
    description="Retrieve all monitored radar zones and synoptic sectors."
)
def list_regions() -> RegionsListResponse:
    return region_service.list_regions()


@router.get(
    "/{region_id}",
    response_model=Region,
    summary="Get Region Details",
    description="Retrieve metadata for a specific geographic region or radar sector."
)
def get_region(region_id: str) -> Region:
    region = region_service.get_region(region_id)
    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region '{region_id}' not found. Available demo regions include: ODISHA-07, KONKAN-23, GANGA-10, DECCAN-31."
        )
    return region


@router.get(
    "/{region_id}/risk",
    response_model=RegionRisk,
    summary="Get Regional Bust Risk Assessment",
    description="Retrieve forecast bust probability, confidence score, raw vs AI-corrected precipitation, and heavy rainfall exceedance chances."
)
def get_region_risk(region_id: str) -> RegionRisk:
    risk = region_service.get_region_risk(region_id)
    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region '{region_id}' not found. Available demo regions include: ODISHA-07, KONKAN-23, GANGA-10, DECCAN-31."
        )
    return risk


@router.get(
    "/{region_id}/explanations",
    response_model=RegionExplanation,
    summary="Get Regional Bust Explanations",
    description="Retrieve physical and meteorological diagnostic explanations for why this region is at risk of a forecast bust."
)
def get_region_explanations(region_id: str) -> RegionExplanation:
    explanation = region_service.get_region_explanations(region_id)
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region '{region_id}' not found. Available demo regions include: ODISHA-07, KONKAN-23, GANGA-10, DECCAN-31."
        )
    return explanation
