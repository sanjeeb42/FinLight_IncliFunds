from typing import List, Dict
from schemas import AssessmentQuestion, AssessmentResult

class FinancialKnowledgeAssessment:
    def __init__(self):
        self.questions = [
            {
                "id": 1,
                "question": "What is the difference between saving and investing?",
                "options": [
                    "Saving is for short-term goals, investing is for long-term wealth building",
                    "Saving and investing are the same thing",
                    "Saving is risky, investing is safe",
                    "Saving is only for rich people"
                ],
                "correct_answer": 0,
                "difficulty_level": "basic"
            },
            {
                "id": 2,
                "question": "What is compound interest?",
                "options": [
                    "Interest paid only on the principal amount",
                    "Interest earned on both principal and previously earned interest",
                    "A type of bank fee",
                    "Interest that decreases over time"
                ],
                "correct_answer": 1,
                "difficulty_level": "intermediate"
            },
            {
                "id": 3,
                "question": "What should be your first financial priority?",
                "options": [
                    "Investing in stocks",
                    "Buying insurance",
                    "Building an emergency fund",
                    "Taking a loan for business"
                ],
                "correct_answer": 2,
                "difficulty_level": "basic"
            },
            {
                "id": 4,
                "question": "What is diversification in investing?",
                "options": [
                    "Putting all money in one investment",
                    "Spreading investments across different assets to reduce risk",
                    "Only investing in government bonds",
                    "Avoiding all investments"
                ],
                "correct_answer": 1,
                "difficulty_level": "intermediate"
            },
            {
                "id": 5,
                "question": "What is a credit score?",
                "options": [
                    "The amount of money you have in bank",
                    "A number that represents your creditworthiness",
                    "Your monthly income",
                    "The interest rate on your savings account"
                ],
                "correct_answer": 1,
                "difficulty_level": "advanced"
            }
        ]
        
        self.level_definitions = {
            "beginner": {
                "name": "Money Basics",
                "tagline": "Start your money journey",
                "description": "Learn basic financial terms: income, expense, saving. Understand the difference between needs vs. wants. Simple budgeting exercises. Introduction to cash, bank, mobile wallets.",
                "min_score": 0,
                "max_score": 1
            },
            "intermediate": {
                "name": "Smart Spending",
                "tagline": "Spend wisely, live better",
                "description": "Learn about mindful spending. Basics of saving regularly. Avoiding debt traps. How to compare prices, read offers, avoid scams.",
                "min_score": 2,
                "max_score": 2
            },
            "proficient": {
                "name": "Saving & Goals",
                "tagline": "Save with purpose",
                "description": "Creating short-term and long-term financial goals. Understanding interest, compound growth. Basics of insurance and emergency funds. Introduction to savings accounts, recurring deposits.",
                "min_score": 3,
                "max_score": 3
            },
            "advanced": {
                "name": "Growing Money",
                "tagline": "Let your money work for you",
                "description": "Intro to investments: mutual funds, stocks, fixed deposits. Understanding risk and diversification. Using digital tools for tracking and investing. Tax basics and saving options.",
                "min_score": 4,
                "max_score": 4
            },
            "expert": {
                "name": "Financial Mastery",
                "tagline": "Be your own financial expert",
                "description": "Advanced planning: retirement, children's education, property. Credit scores and responsible borrowing. Understanding market trends, inflation, interest rates. Building wealth with long-term strategies.",
                "min_score": 5,
                "max_score": 5
            }
        }
    
    def get_questions(self) -> List[AssessmentQuestion]:
        """Return all assessment questions"""
        return [AssessmentQuestion(**q) for q in self.questions]
    
    def calculate_score(self, answers: List[Dict]) -> int:
        """Calculate the score based on user answers"""
        score = 0
        for answer in answers:
            question_id = answer["question_id"]
            selected_answer = answer["selected_answer"]
            
            # Find the correct answer for this question
            question = next((q for q in self.questions if q["id"] == question_id), None)
            if question and question["correct_answer"] == selected_answer:
                score += 1
        
        return score
    
    def determine_level(self, score: int) -> str:
        """Determine knowledge level based on score"""
        for level, definition in self.level_definitions.items():
            if definition["min_score"] <= score <= definition["max_score"]:
                return level
        return "beginner"  # Default fallback
    
    def get_assessment_result(self, answers: List[Dict]) -> AssessmentResult:
        """Process assessment and return result"""
        score = self.calculate_score(answers)
        level = self.determine_level(score)
        level_info = self.level_definitions[level]
        
        return AssessmentResult(
            score=score,
            total_questions=len(self.questions),
            knowledge_level=level,
            level_description=level_info["description"],
            tagline=level_info["tagline"]
        )
    
    def get_level_content(self, level: str) -> Dict:
        """Get content for a specific knowledge level"""
        if level in self.level_definitions:
            return self.level_definitions[level]
        return self.level_definitions["beginner"]  # Default fallback

# Global instance
assessment_service = FinancialKnowledgeAssessment()