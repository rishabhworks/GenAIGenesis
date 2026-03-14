import logging
from app.services.ai_service import AIService
from app.schemas.job_schema import ContractExplanationResponse

logger = logging.getLogger(__name__)

class ContractExplainerService:
    """Service for explaining employment contracts in simple language"""
    
    def __init__(self):
        """Initialize contract explainer service"""
        self.ai_service = AIService()
    
    def explain_contract(
        self,
        contract_text: str,
        language_level: str = "simple"
    ) -> ContractExplanationResponse:
        """
        Explain contract clause in simple language
        
        Args:
            contract_text: Contract clause or full contract text
            language_level: "simple", "intermediate", or "detailed"
        
        Returns:
            ContractExplanationResponse with explanation, key points, and risks
        """
        try:
            if not contract_text or len(contract_text.strip()) == 0:
                logger.warning("Empty contract text provided")
                return ContractExplanationResponse(
                    original_text=contract_text,
                    simplified_explanation="Please provide contract text to explain.",
                    key_points=[],
                    potential_risks=[],
                    recommendations=[]
                )
            
            # Use AI service to explain
            explanation = self.ai_service.explain_contract(
                contract_text=contract_text,
                language_level=language_level
            )
            
            return ContractExplanationResponse(
                original_text=contract_text,
                simplified_explanation=explanation.get("simplified_explanation", ""),
                key_points=explanation.get("key_points", []),
                potential_risks=explanation.get("potential_risks", []),
                recommendations=explanation.get("recommendations", [])
            )
            
        except Exception as e:
            logger.error(f"Contract explanation failed: {e}")
            raise
    
    def extract_key_clauses(self, contract_text: str) -> list:
        """
        Extract important clauses from contract
        
        Args:
            contract_text: Full contract text
        
        Returns:
            List of important clauses
        """
        try:
            # Common clause identifiers
            clause_keywords = [
                "termination",
                "salary",
                "benefits",
                "vacation",
                "notice period",
                "probation",
                "confidentiality",
                "non-compete",
                "liability",
                "dispute resolution",
                "hours",
                "overtime",
                "bonus",
                "insurance",
                "pension"
            ]
            
            extracted_clauses = []
            lines = contract_text.split('\n')
            
            current_clause = ""
            for line in lines:
                line_lower = line.lower()
                
                # Check if line contains clause keyword
                for keyword in clause_keywords:
                    if keyword in line_lower:
                        if current_clause:
                            extracted_clauses.append(current_clause.strip())
                        current_clause = line
                        break
                else:
                    if current_clause:
                        current_clause += "\n" + line
            
            if current_clause:
                extracted_clauses.append(current_clause.strip())
            
            return extracted_clauses
            
        except Exception as e:
            logger.error(f"Clause extraction failed: {e}")
            return []
    
    def flag_risky_clauses(self, contract_text: str) -> list:
        """
        Identify potentially risky clauses
        
        Args:
            contract_text: Full contract text
        
        Returns:
            List of risky clause identifiers
        """
        risky_patterns = [
            "non-compete",
            "no liability",
            "at-will employment",
            "arbitration only",
            "waive all rights",
            "confidentiality",
            "intellectual property",
            "survival",
            "assignment",
            "termination for cause"
        ]
        
        risky_clauses = []
        lines = contract_text.split('\n')
        
        for line in lines:
            line_lower = line.lower()
            for pattern in risky_patterns:
                if pattern in line_lower:
                    risky_clauses.append({
                        "clause": line.strip(),
                        "risk_type": pattern,
                        "severity": "high" if pattern in ["non-compete", "waive all rights"] else "medium"
                    })
                    break
        
        return risky_clauses
