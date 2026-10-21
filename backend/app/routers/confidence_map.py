from fastapi import APIRouter
from ..schemas.confidence_map import ConfidenceMapResponse
from ..services.confidence_map_service import confidence_map_service

router = APIRouter(prefix="/confidence-map", tags=["Confidence Map"])


@router.get(
    "",
    response_model=ConfidenceMapResponse,
    summary="Get Geospatial Confidence Map Layer",
    description=(
        "Retrieve regional confidence values, bust probabilities, radar sector radii, "
        "and standard GeoJSON FeatureCollection suitable for Leaflet/Mapbox frontend rendering."
    )
)
def get_confidence_map() -> ConfidenceMapResponse:
    return confidence_map_service.get_map_data()
