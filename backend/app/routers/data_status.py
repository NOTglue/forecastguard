from fastapi import APIRouter
from ..schemas.data_status import DataStatusResponse
from ..services.metadata_service import metadata_service

router = APIRouter(prefix="/data-status", tags=["Data Provenance & Status"])


@router.get(
    "",
    response_model=DataStatusResponse,
    summary="Get Data Feed Status & Provenance",
    description=(
        "Retrieve data source identifiers, last updated timestamp, data freshness in seconds, "
        "and clear indicators confirming synthetic demonstration vs operational data mode."
    )
)
def get_data_status() -> DataStatusResponse:
    return metadata_service.get_data_status()
