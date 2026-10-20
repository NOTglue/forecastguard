from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field


def get_utc_now() -> datetime:
    """Helper to return current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


class BaseDemoModel(BaseModel):
    """Base Pydantic model enforcing demo data marker and strict schema configuration."""
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    
    data_mode: str = Field(
        default="DEMO",
        description="Data mode indicator (always 'DEMO' for initial demonstration releases)"
    )


class MessageResponse(BaseModel):
    """Standard generic message response."""
    message: str
    detail: str | None = None
