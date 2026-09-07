from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_v1_router
from app.database.session import engine, Base, ensure_schema_migrations
from app.database.seeder import seed_database
from app.ml.model_manager import model_manager
from app.utils.logger import logger

# Initialize database schema & seed initial data
try:
    Base.metadata.create_all(bind=engine)
    ensure_schema_migrations()
    seed_database()
    logger.info("Database schema initialized and seeded successfully.")
except Exception as e:
    logger.warning(f"Database initialization notice: {e}")

# Startup check for ML Model & Vectorizer
try:
    status_info = model_manager.get_status()
    if status_info["model_status"] == "READY":
        logger.info(f"ML Security Pipeline: Linear SVM model and TF-IDF vectorizer ready ({status_info['classes']} classes).")
    else:
        logger.warning(f"ML Security Pipeline: ML model unavailable ({status_info['detail']}).")
except Exception as e:
    logger.warning(f"ML Model startup notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0-production",
    description="""
# 🛡️ Universal AI Guardrail API (Production)

Agent-independent security layer that sits between users and LLM-powered agents to detect, classify, and mitigate malicious prompts and prompt injection attacks in real time.

### Key Capabilities:
* **Dual Pipeline Security**: Real-time **Input Guardrail** (Rule + Linear SVM Ensemble) and **Output Guardrail** (Secret & System Prompt Leakage check).
* **Universal Multi-Agent Support**: Travel, Shopping, Banking, Coding, Research, and custom agents.
* **Trained ML Classifier**: TF-IDF N-gram feature extraction + Linear SVM Classifier with 92.73% test accuracy.
* **Modular Rule Engine**: Specialized security rules for prompt injection, jailbreaks, extraction, and obfuscation.
* **Persistent Telemetry**: SQLite storage for live alerts, agent stats, and audit logs.
    """,
    openapi_tags=[
        {"name": "Guardrail", "description": "Core Input & Output inspection and policy enforcement endpoints."},
        {"name": "Alerts", "description": "Security alerts and forensic incident records."},
        {"name": "Agents", "description": "Protected agents directory and registration."},
        {"name": "Analytics", "description": "Live security telemetry and risk distributions."},
        {"name": "ML", "description": "Active ML model metadata and baseline comparison metrics."},
        {"name": "Benchmarks", "description": "AgentDojo synthetic security benchmark runner."},
        {"name": "Configuration", "description": "Dynamic threshold and protection module policy engine."},
        {"name": "System", "description": "Health, metadata, and operational status."}
    ]
)

from app.api.auth import router as auth_router

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix="/api")  # Support both /api/auth and /api/v1/auth

@app.get("/", tags=["System"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0-production",
        "status": "ACTIVE",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "guardrail_check": f"{settings.API_V1_STR}/guardrail/check",
        "model_status": f"{settings.API_V1_STR}/guardrail/model-status",
        "output_guardrail": f"{settings.API_V1_STR}/guardrail/check-output"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
