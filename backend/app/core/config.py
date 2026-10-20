import os
from typing import List


class Settings:
    """
    Application configuration settings.
    Reads from environment variables with sensible defaults for local development.
    """
    PROJECT_NAME: str = "ForecastGuard"
    PROJECT_TITLE: str = "ForecastGuard API"
    PROJECT_DESCRIPTION: str = (
        "Backend API for Forecast Bust Detection (SIH26079). "
        "Monitors numerical weather prediction (NWP) runs, detects extreme forecast bust risks, "
        "provides AI bias-corrected fields, diagnostic explanations, and verification metrics."
    )
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Operational & Data Mode
    DATA_MODE: str = os.getenv("FORECASTGUARD_DATA_MODE", "DEMO")
    
    # CORS Configuration
    # Supports comma-separated environment variable or default localhost ports
    _cors_env: str = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
    )
    
    @property
    def cors_origins(self) -> List[str]:
        if not self._cors_env:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        # If set to "*", allow all origins (useful in certain dev container setups)
        if self._cors_env.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self._cors_env.split(",") if origin.strip()]


settings = Settings()
