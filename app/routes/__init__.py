from app.routes.voice_routes import router as voice_router
from app.routes.contract_routes import router as contract_router
from app.routes.chatbot_routes import router as chatbot_router
from app.routes.onboarding_routes import router as onboarding_router

__all__ = ["voice_router", "contract_router", "chatbot_router", "onboarding_router"]
