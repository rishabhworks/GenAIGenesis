from app.routes.voice_routes import router as voice_router
from app.routes.job_routes import router as job_router
from app.routes.pay_routes import router as pay_router
from app.routes.contract_routes import router as contract_router
from app.routes.chatbot_routes import router as chatbot_router

__all__ = ["voice_router", "job_router", "pay_router", "contract_router", "chatbot_router"]
