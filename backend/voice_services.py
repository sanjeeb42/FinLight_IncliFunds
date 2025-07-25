import os
import tempfile
import uuid
from typing import Optional, Dict, Any
from gtts import gTTS
import speech_recognition as sr
from io import BytesIO
import base64
import json
from datetime import datetime
import httpx
from dotenv import load_dotenv
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.auth import default

# Load environment variables
load_dotenv()

# Language mapping for gTTS
LANGUAGE_MAPPING = {
    "en": "en",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "bn": "bn",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "mr": "mr",
    "pa": "pa",
    "or": "or",
    "as": "as",
    "ur": "ur",
    "ne": "ne",
    "si": "si"
}

# Regional language support
REGIONAL_LANGUAGES = {
    "hindi": "hi",
    "tamil": "ta",
    "telugu": "te",
    "bengali": "bn",
    "gujarati": "gu",
    "kannada": "kn",
    "malayalam": "ml",
    "marathi": "mr",
    "punjabi": "pa",
    "odia": "or",
    "assamese": "as",
    "urdu": "ur",
    "nepali": "ne",
    "sinhala": "si"
}

# Common phrases in different languages for better TTS
COMMON_PHRASES = {
    "hi": {
        "welcome": "आपका स्वागत है",
        "savings": "बचत",
        "investment": "निवेश",
        "goal": "लक्ष्य",
        "money": "पैसा",
        "help": "मदद"
    },
    "ta": {
        "welcome": "வரவேற்கிறோம்",
        "savings": "சேமிப்பு",
        "investment": "முதலீடு",
        "goal": "இலக்கு",
        "money": "பணம்",
        "help": "உதவி"
    },
    "te": {
        "welcome": "స్వాగతం",
        "savings": "పొదుపు",
        "investment": "పెట్టుబడి",
        "goal": "లక్ష్యం",
        "money": "డబ్బు",
        "help": "సహాయం"
    },
    "bn": {
        "welcome": "স্বাগতম",
        "savings": "সঞ্চয়",
        "investment": "বিনিয়োগ",
        "goal": "লক্ষ্য",
        "money": "টাকা",
        "help": "সাহায্য"
    },
    "gu": {
        "welcome": "સ્વાગત છે",
        "savings": "બચત",
        "investment": "રોકાણ",
        "goal": "લક્ષ્ય",
        "money": "પૈસા",
        "help": "મદદ"
    },
    "mr": {
        "welcome": "स्वागत आहे",
        "savings": "बचत",
        "investment": "गुंतवणूक",
        "goal": "ध्येय",
        "money": "पैसा",
        "help": "मदत"
    }
}

async def text_to_speech(text: str, language: str = "en", slow: bool = False) -> str:
    """
    Convert text to speech and return audio file path.
    
    Args:
        text: Text to convert to speech
        language: Language code (e.g., 'en', 'hi', 'ta')
        slow: Whether to speak slowly
    
    Returns:
        Path to the generated audio file
    """
    try:
        # Map language code if needed
        lang_code = LANGUAGE_MAPPING.get(language, "en")
        
        # Create gTTS object
        tts = gTTS(
            text=text,
            lang=lang_code,
            slow=slow
        )
        
        # Generate unique filename
        audio_filename = f"tts_{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(tempfile.gettempdir(), audio_filename)
        
        # Save audio file
        tts.save(audio_path)
        
        # In production, you'd upload this to a cloud storage service
        # For now, return the local path
        return audio_path
        
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        raise Exception(f"Text-to-speech conversion failed: {str(e)}")

def get_access_token_from_service_account() -> Optional[str]:
    """
    Get access token using Application Default Credentials (ADC) or service account credentials.
    
    Returns:
        Access token string or None if credentials not available
    """
    try:
        # Try Application Default Credentials first
        try:
            credentials, project = default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
            request = Request()
            credentials.refresh(request)
            return credentials.token
        except Exception as adc_error:
            print(f"ADC authentication failed: {str(adc_error)}, trying service account...")
        
        # Fallback to service account key file
        service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not service_account_path or not os.path.exists(service_account_path):
            return None
        
        # Load service account credentials
        credentials = service_account.Credentials.from_service_account_file(
            service_account_path,
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        
        # Refresh the credentials to get access token
        request = Request()
        credentials.refresh(request)
        
        return credentials.token
        
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        return None

async def speech_to_text_cloud(
    audio_data: bytes,
    language: str = "en",
    audio_format: str = "wav"
) -> Dict[str, Any]:
    """
    Convert speech audio to text using Google Cloud Speech-to-Text API.
    Supports both API key and service account authentication.
    
    Args:
        audio_data: Audio data in bytes
        language: Expected language of the speech
        audio_format: Format of the audio (wav, mp3, etc.)
    
    Returns:
        Dictionary containing transcribed text and confidence
    """
    try:
        # Try service account authentication first
        access_token = get_access_token_from_service_account()
        
        # Fall back to API key if service account not available
        api_key = os.getenv("GOOGLE_CLOUD_API_KEY")
        
        if not access_token and not api_key:
            raise Exception("Neither service account credentials nor API key found. Please set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_API_KEY")
        
        # Encode audio data to base64
        audio_content = base64.b64encode(audio_data).decode('utf-8')
        
        # Map language for Cloud Speech API
        lang_code = get_speech_recognition_language(language)
        
        # Prepare request payload
        payload = {
            "config": {
                "encoding": "WEBM_OPUS" if audio_format == "webm" else "LINEAR16",
                "sampleRateHertz": 16000,
                "languageCode": lang_code,
                "enableAutomaticPunctuation": True,
                "enableWordTimeOffsets": False,
                "model": "latest_long",
                "useEnhanced": True
            },
            "audio": {
                "content": audio_content
            }
        }
        
        # Prepare headers and URL based on authentication method
        if access_token:
            # Use service account authentication
            url = "https://speech.googleapis.com/v1/speech:recognize"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
        else:
            # Use API key authentication
            url = f"https://speech.googleapis.com/v1/speech:recognize?key={api_key}"
            headers = {"Content-Type": "application/json"}
        
        # Make API request
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers,
                timeout=30.0
            )
        
        if response.status_code != 200:
            raise Exception(f"Cloud Speech API error: {response.status_code} - {response.text}")
        
        result = response.json()
        
        # Extract transcription and confidence
        if "results" in result and len(result["results"]) > 0:
            alternatives = result["results"][0].get("alternatives", [])
            if alternatives:
                transcript = alternatives[0].get("transcript", "")
                confidence = alternatives[0].get("confidence", 0.9)
                
                return {
                    "text": transcript,
                    "confidence": confidence,
                    "language": language,
                    "success": True,
                    "api_used": "google_cloud"
                }
        
        return {
            "text": "",
            "confidence": 0.0,
            "language": language,
            "success": False,
            "error": "No transcription results from Cloud Speech API",
            "api_used": "google_cloud"
        }
        
    except Exception as e:
        return {
            "text": "",
            "confidence": 0.0,
            "language": language,
            "success": False,
            "error": f"Cloud Speech-to-text conversion failed: {str(e)}",
            "api_used": "google_cloud"
        }

async def speech_to_text(
    audio_data: bytes,
    language: str = "en",
    audio_format: str = "wav"
) -> Dict[str, Any]:
    """
    Convert speech audio to text. Prioritizes Google Cloud Speech-to-Text API if available,
    falls back to free Google Speech Recognition.
    
    Args:
        audio_data: Audio data in bytes
        language: Expected language of the speech
        audio_format: Format of the audio (wav, mp3, etc.)
    
    Returns:
        Dictionary containing transcribed text and confidence
    """
    # Try Google Cloud Speech-to-Text API first if credentials are available
    if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("GOOGLE_CLOUD_API_KEY"):
        cloud_result = await speech_to_text_cloud(audio_data, language, audio_format)
        if cloud_result["success"]:
            return cloud_result
        # If Cloud API fails, fall back to free version
        print(f"Cloud Speech API failed: {cloud_result.get('error', 'Unknown error')}, falling back to free API")
    
    # Fallback to free Google Speech Recognition
    try:
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Create temporary file for audio data
        with tempfile.NamedTemporaryFile(suffix=f".{audio_format}", delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_audio_path = temp_audio.name
        
        # Load audio file
        with sr.AudioFile(temp_audio_path) as source:
            # Adjust for ambient noise
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            # Record the audio
            audio = recognizer.record(source)
        
        # Clean up temporary file
        os.unlink(temp_audio_path)
        
        # Map language for speech recognition
        lang_code = get_speech_recognition_language(language)
        
        try:
            # Use Google Speech Recognition
            text = recognizer.recognize_google(audio, language=lang_code)
            confidence = 0.8  # Free API gets lower confidence estimate
            
            return {
                "text": text,
                "confidence": confidence,
                "language": language,
                "success": True,
                "api_used": "google_free"
            }
            
        except sr.UnknownValueError:
            return {
                "text": "",
                "confidence": 0.0,
                "language": language,
                "success": False,
                "error": "Could not understand audio",
                "api_used": "google_free"
            }
            
        except sr.RequestError as e:
            return {
                "text": "",
                "confidence": 0.0,
                "language": language,
                "success": False,
                "error": f"Speech recognition service error: {str(e)}",
                "api_used": "google_free"
            }
            
    except Exception as e:
        return {
            "text": "",
            "confidence": 0.0,
            "language": language,
            "success": False,
            "error": f"Speech-to-text conversion failed: {str(e)}",
            "api_used": "google_free"
        }

def get_speech_recognition_language(language: str) -> str:
    """
    Map our language codes to speech recognition language codes.
    
    Args:
        language: Our internal language code
    
    Returns:
        Language code for speech recognition
    """
    # Speech recognition language mapping
    sr_mapping = {
        "en": "en-US",
        "hi": "hi-IN",
        "ta": "ta-IN",
        "te": "te-IN",
        "bn": "bn-IN",
        "gu": "gu-IN",
        "kn": "kn-IN",
        "ml": "ml-IN",
        "mr": "mr-IN",
        "pa": "pa-IN",
        "or": "or-IN",
        "as": "as-IN",
        "ur": "ur-IN",
        "ne": "ne-NP",
        "si": "si-LK"
    }
    
    return sr_mapping.get(language, "en-US")

async def process_voice_command(
    audio_data: str,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Process voice command from base64 encoded audio data.
    
    Args:
        audio_data: Base64 encoded audio data
        language: Expected language of the speech
    
    Returns:
        Dictionary containing processed command and response
    """
    try:
        # Decode base64 audio data
        audio_bytes = base64.b64decode(audio_data)
        
        # Convert speech to text
        stt_result = await speech_to_text(audio_bytes, language)
        
        if not stt_result["success"]:
            return {
                "success": False,
                "error": stt_result["error"],
                "transcribed_text": ""
            }
        
        transcribed_text = stt_result["text"]
        
        # Process the command (this would integrate with your AI services)
        # For now, return a simple response
        response_text = await generate_voice_response(transcribed_text, language)
        
        # Convert response to speech
        audio_response_path = await text_to_speech(response_text, language)
        
        return {
            "success": True,
            "transcribed_text": transcribed_text,
            "response_text": response_text,
            "audio_response_path": audio_response_path,
            "confidence": stt_result["confidence"]
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Voice command processing failed: {str(e)}",
            "transcribed_text": ""
        }

async def generate_voice_response(text: str, language: str) -> str:
    """
    Generate appropriate response for voice input.
    
    Args:
        text: Transcribed text from user
        language: Language of the conversation
    
    Returns:
        Response text in the same language
    """
    text_lower = text.lower()
    
    # Simple keyword-based responses
    # In production, this would integrate with your AI services
    
    if language == "hi":
        if any(word in text_lower for word in ["बचत", "save", "saving"]):
            return "आपकी बचत के लिए मैं आपकी मदद कर सकता हूं। आप कितना बचाना चाहते हैं?"
        elif any(word in text_lower for word in ["निवेश", "invest", "investment"]):
            return "निवेश के लिए कई विकल्प हैं। आपका जोखिम स्तर क्या है?"
        elif any(word in text_lower for word in ["लक्ष्य", "goal"]):
            return "आपका वित्तीय लक्ष्य क्या है? मैं योजना बनाने में मदद कर सकता हूं।"
        else:
            return "मैं आपकी वित्तीय सहायता के लिए यहां हूं। आप क्या जानना चाहते हैं?"
    
    elif language == "ta":
        if any(word in text_lower for word in ["சேமிப்பு", "save", "saving"]):
            return "உங்கள் சேமிப்புக்கு நான் உதவ முடியும். எவ்வளவு சேமிக்க விரும்புகிறீர்கள்?"
        elif any(word in text_lower for word in ["முதலீடு", "invest", "investment"]):
            return "முதலீட்டுக்கு பல வழிகள் உள்ளன। உங்கள் ரிஸ்க் லெவல் என்ன?"
        elif any(word in text_lower for word in ["இலக்கு", "goal"]):
            return "உங்கள் நிதி இலக்கு என்ன? திட்டமிட உதவ முடியும்।"
        else:
            return "உங்கள் நிதி உதவிக்காக நான் இங்கே இருக்கிறேன். என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?"
    
    else:  # English
        if any(word in text_lower for word in ["save", "saving", "savings"]):
            return "I can help you with your savings plan. How much would you like to save monthly?"
        elif any(word in text_lower for word in ["invest", "investment", "investing"]):
            return "There are many investment options available. What's your risk tolerance level?"
        elif any(word in text_lower for word in ["goal", "goals", "target"]):
            return "What's your financial goal? I can help you create a plan to achieve it."
        elif any(word in text_lower for word in ["scheme", "government", "yojana"]):
            return "I can help you find government schemes you're eligible for. What's your state?"
        elif any(word in text_lower for word in ["wedding", "marriage", "shadi"]):
            return "Wedding planning requires careful budgeting. When is the wedding planned?"
        elif any(word in text_lower for word in ["festival", "diwali", "holi"]):
            return "Festival savings are important! Which festival are you planning for?"
        else:
            return "I'm here to help with your financial planning. What would you like to know about?"

def get_supported_languages() -> Dict[str, str]:
    """
    Get list of supported languages for voice features.
    
    Returns:
        Dictionary mapping language codes to language names
    """
    return {
        "en": "English",
        "hi": "हिंदी (Hindi)",
        "ta": "தமிழ் (Tamil)",
        "te": "తెలుగు (Telugu)",
        "bn": "বাংলা (Bengali)",
        "gu": "ગુજરાતી (Gujarati)",
        "kn": "ಕನ್ನಡ (Kannada)",
        "ml": "മലയാളം (Malayalam)",
        "mr": "मराठी (Marathi)",
        "pa": "ਪੰਜਾਬੀ (Punjabi)",
        "or": "ଓଡ଼ିଆ (Odia)",
        "as": "অসমীয়া (Assamese)",
        "ur": "اردو (Urdu)",
        "ne": "नेपाली (Nepali)",
        "si": "සිංහල (Sinhala)"
    }

def validate_audio_format(audio_data: bytes) -> bool:
    """
    Validate if the audio data is in a supported format.
    
    Args:
        audio_data: Audio data in bytes
    
    Returns:
        True if format is supported, False otherwise
    """
    # Check for common audio file headers
    if audio_data.startswith(b'RIFF') and b'WAVE' in audio_data[:12]:
        return True  # WAV format
    elif audio_data.startswith(b'ID3') or audio_data.startswith(b'\xff\xfb'):
        return True  # MP3 format
    elif audio_data.startswith(b'OggS'):
        return True  # OGG format
    elif audio_data.startswith(b'fLaC'):
        return True  # FLAC format
    
    return False

async def enhance_audio_quality(audio_data: bytes) -> bytes:
    """
    Enhance audio quality for better speech recognition.
    
    Args:
        audio_data: Original audio data
    
    Returns:
        Enhanced audio data
    """
    # In a production environment, you might use libraries like:
    # - librosa for audio processing
    # - noisereduce for noise reduction
    # - scipy for filtering
    
    # For now, return the original data
    # This is where you'd implement noise reduction, normalization, etc.
    return audio_data

def get_language_from_text(text: str) -> str:
    """
    Detect language from text content.
    
    Args:
        text: Text to analyze
    
    Returns:
        Detected language code
    """
    try:
        from langdetect import detect
        detected = detect(text)
        
        # Map detected language to our supported languages
        if detected in LANGUAGE_MAPPING:
            return detected
        else:
            return "en"  # Default to English
            
    except:
        return "en"  # Default to English if detection fails

async def create_voice_tutorial(language: str = "en") -> str:
    """
    Create a voice tutorial for new users.
    
    Args:
        language: Language for the tutorial
    
    Returns:
        Path to the tutorial audio file
    """
    tutorials = {
        "en": "Welcome to FinTwin Plus! I'm your voice assistant. You can ask me about savings, investments, government schemes, and financial planning. Try saying 'Help me save money' or 'What government schemes am I eligible for?'",
        "hi": "फिनट्विन प्लस में आपका स्वागत है! मैं आपका वॉयस असिस्टेंट हूं। आप मुझसे बचत, निवेश, सरकारी योजनाओं और वित्तीय योजना के बारे में पूछ सकते हैं। कहकर देखें 'मुझे पैसे बचाने में मदद करें' या 'मैं किन सरकारी योजनाओं के लिए पात्र हूं?'",
        "ta": "FinTwin Plus-க்கு வரவேற்கிறோம்! நான் உங்கள் குரல் உதவியாளர். சேமிப்பு, முதலீடு, அரசு திட்டங்கள் மற்றும் நிதி திட்டமிடல் பற்றி என்னிடம் கேட்கலாம். 'பணம் சேமிக்க உதவுங்கள்' அல்லது 'நான் எந்த அரசு திட்டங்களுக்கு தகுதியானவர்?' என்று சொல்லி பாருங்கள்।"
    }
    
    tutorial_text = tutorials.get(language, tutorials["en"])
    return await text_to_speech(tutorial_text, language, slow=True)

# Voice command patterns for different languages
VOICE_PATTERNS = {
    "en": {
        "savings": ["save", "saving", "savings", "save money"],
        "investment": ["invest", "investment", "investing", "invest money"],
        "goals": ["goal", "goals", "target", "aim"],
        "schemes": ["scheme", "government scheme", "yojana", "government program"],
        "help": ["help", "assist", "support", "guide"]
    },
    "hi": {
        "savings": ["बचत", "पैसे बचाना", "बचाना", "सेविंग"],
        "investment": ["निवेश", "इन्वेस्टमेंट", "पैसा लगाना", "निवेश करना"],
        "goals": ["लक्ष्य", "गोल", "उद्देश्य", "टारगेट"],
        "schemes": ["योजना", "सरकारी योजना", "स्कीम", "सरकारी स्कीम"],
        "help": ["मदद", "सहायता", "हेल्प", "गाइड"]
    },
    "ta": {
        "savings": ["சேமிப்பு", "பணம் சேமிக்க", "சேமிக்க", "சேவிங்"],
        "investment": ["முதலீடு", "இன்வெஸ்ட்மென்ட்", "பணம் போட", "முதலீடு செய்ய"],
        "goals": ["இலக்கு", "கோல்", "நோக்கம்", "டார்கெட்"],
        "schemes": ["திட்டம்", "அரசு திட்டம்", "ஸ்கீம்", "அரசு ஸ்கீம்"],
        "help": ["உதவி", "சஹாயம்", "ஹெல்ப்", "கைட்"]
    }
}

def match_voice_pattern(text: str, language: str) -> Optional[str]:
    """
    Match voice input to predefined patterns.
    
    Args:
        text: Transcribed text
        language: Language of the text
    
    Returns:
        Matched pattern category or None
    """
    if language not in VOICE_PATTERNS:
        language = "en"
    
    patterns = VOICE_PATTERNS[language]
    text_lower = text.lower()
    
    for category, keywords in patterns.items():
        if any(keyword in text_lower for keyword in keywords):
            return category
    
    return None