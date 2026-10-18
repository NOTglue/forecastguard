from fastapi import FastAPI

app = FastAPI(
    title="ForecastGuard API",
    description="Backend API for Forecast Bust Detection",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": "ForecastGuard"
    }
