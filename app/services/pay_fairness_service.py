import logging
from typing import Dict

logger = logging.getLogger(__name__)

class PayFairnessService:
    """Service for detecting underpaid job postings"""
    
    # Typical market wages for different trades in Canada (hourly rates)
    # This should be updated with real data from Statistics Canada or labor surveys
    MARKET_WAGE_DATA = {
        "electrician": 32.50,
        "plumber": 34.00,
        "carpenter": 28.50,
        "hvac": 30.75,
        "welder": 28.00,
        "ironworker": 35.00,
        "heavy equipment operator": 32.00,
        "construction laborer": 22.00,
        "roofer": 33.50,
        "painter": 26.00,
        "mason": 29.00,
        "pipefitter": 32.50,
        "excavator operator": 30.00,
        "general contractor": 35.00,
        "mechanic": 31.00,
    }
    
    @staticmethod
    def get_market_rate(trade: str, location: str = "Canada") -> float:
        """
        Get market wage for a trade
        
        Args:
            trade: Trade type
            location: Location (for future integration with regional data)
        
        Returns:
            Market hourly rate in CAD
        """
        trade_lower = trade.lower()
        
        # Direct match
        if trade_lower in PayFairnessService.MARKET_WAGE_DATA:
            return PayFairnessService.MARKET_WAGE_DATA[trade_lower]
        
        # Partial match
        for market_trade, rate in PayFairnessService.MARKET_WAGE_DATA.items():
            if trade_lower in market_trade or market_trade in trade_lower:
                return rate
        
        # Default to general trades if no match
        logger.warning(f"Trade '{trade}' not in market data, using default")
        return 28.00
