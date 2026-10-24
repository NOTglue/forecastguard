from fastapi import APIRouter
from ..schemas.cases_models import (
    CasesListResponse,
    ModelsListResponse,
)
from ..services.metadata_service import metadata_service

router = APIRouter(tags=["Case Studies & Models"])


@router.get(
    "/cases",
    response_model=CasesListResponse,
    summary="List Forecast Bust Case Studies",
    description="Retrieve historical or synthetic case studies illustrating severe numerical weather forecast bust mechanisms."
)
def list_cases() -> CasesListResponse:
    return metadata_service.list_cases()


@router.get(
    "/models",
    response_model=ModelsListResponse,
    summary="List ML Model Architectures",
    description="Retrieve model metadata, target variables, input features, and supported forecast horizons."
)
def list_models() -> ModelsListResponse:
    return metadata_service.list_models()
