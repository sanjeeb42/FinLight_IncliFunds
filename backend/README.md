# FinTwin+ Backend

A comprehensive financial planning and advisory backend built with FastAPI, featuring AI-powered cultural nudges, multilingual voice assistance, and community-driven learning.

## 🚀 Features

### Core Features
- **JWT Authentication** - Secure user authentication with access and refresh tokens
- **Cultural & State-Aware Financial Twin** - Personalized financial advice based on cultural context
- **Multilingual Voice Assistant** - Support for 15+ Indian languages
- **Community Learning Circles** - Peer-to-peer financial learning and challenges
- **Government Schemes Integration** - Comprehensive database of government financial schemes
- **Gamified Financial Scoring** - Dynamic scoring system with cultural considerations
- **AI-Powered Nudges** - Contextual financial advice based on festivals, seasons, and life events

### Technical Features
- **FastAPI Framework** - High-performance async API
- **SQLAlchemy ORM** - Database abstraction with SQLite/PostgreSQL support
- **Pydantic Validation** - Request/response validation and serialization
- **OpenAI Integration** - AI-powered financial advice and voice processing
- **Google TTS/STT** - Text-to-speech and speech-to-text capabilities
- **CORS Support** - Cross-origin resource sharing for frontend integration
- **Rate Limiting** - API rate limiting for security
- **Comprehensive Logging** - Structured logging with rotation

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git

## 🛠️ Installation

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Run the setup script**
   ```bash
   python start.py --setup-only
   ```

3. **Start the server**
   ```bash
   python start.py
   ```

### Manual Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys
   ```

3. **Initialize database**
   ```bash
   python init_db.py
   ```

4. **Start the server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=sqlite:///./fintwin.db

# JWT Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key

# Google Cloud Service Account (Recommended for Speech-to-Text)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### API Keys Required

1. **OpenAI API Key** - For AI-powered financial advice
   - Get from: https://platform.openai.com/api-keys
   - Used for: Cultural nudges, financial scoring, voice processing

2. **Google Cloud Speech-to-Text** - For enhanced voice services
   - **Service Account (Recommended)**: See `GOOGLE_CLOUD_SETUP.md` for detailed setup
   - **API Key (Alternative)**: Get from https://console.cloud.google.com/
   - Enable: Speech-to-Text API, Text-to-Speech API
   - Used for: High-accuracy multilingual voice assistance
   - Supports: 15+ Indian languages with enhanced accuracy

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🎤 Google Cloud Speech-to-Text Setup

For enhanced voice recognition accuracy, especially for Indian languages, configure Google Cloud Speech-to-Text:

### Quick Setup

1. **Follow the detailed guide**: See `GOOGLE_CLOUD_SETUP.md` for complete instructions
2. **Set environment variable**: Add `GOOGLE_APPLICATION_CREDENTIALS` to your `.env` file
3. **Restart the server**: The system will automatically use Cloud Speech when available

### Authentication Methods

- **Service Account (Recommended)**: More secure, suitable for production
- **API Key (Fallback)**: Simpler setup, good for development

### Benefits

- **Higher Accuracy**: Better transcription quality for Indian languages
- **Advanced Features**: Automatic punctuation, confidence scores
- **Longer Audio Support**: Handle longer voice inputs
- **Better Noise Handling**: Improved performance in noisy environments

### Fallback Behavior

If Google Cloud Speech-to-Text is not configured, the system automatically falls back to the free Google Speech Recognition API, ensuring continuous functionality.

## 🔐 Authentication

### Default Admin Account

```
Email: admin@fintwin.com
Password: admin123
```

**⚠️ Change the default password in production!**

### Authentication Flow

1. **Register/Login** - Get access and refresh tokens
2. **Access Protected Routes** - Include `Authorization: Bearer <token>` header
3. **Token Refresh** - Use refresh token to get new access token

### Example Authentication

```bash
# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@fintwin.com&password=admin123"

# Use token
curl -X GET "http://localhost:8000/users/profile" \
  -H "Authorization: Bearer <your-access-token>"
```

## 🗄️ Database

### Models

- **User** - User accounts and profiles
- **FinancialProfile** - Financial information and preferences
- **CommunityCircle** - Learning communities
- **LearningContent** - Educational content
- **GovernmentScheme** - Government financial schemes
- **LocalAgent** - Local financial advisors
- **SavingsGoal** - User savings goals and tracking
- **VoiceInteraction** - Voice assistant interactions
- **FinancialScore** - Gamified scoring system
- **CulturalNudge** - AI-powered cultural advice
- **InvestmentFilter** - Religious/cultural investment filters

### Database Operations

```bash
# Initialize database with sample data
python init_db.py

# Reset database (caution: deletes all data)
rm fintwin.db && python init_db.py
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/financial-profile` - Get financial profile
- `PUT /users/financial-profile` - Update financial profile

### Voice Assistant
- `POST /voice/process` - Process voice command
- `POST /voice/text-to-speech` - Convert text to speech
- `GET /voice/languages` - Get supported languages

### Community
- `GET /community/circles` - List community circles
- `POST /community/circles/{circle_id}/join` - Join a circle
- `GET /community/learning-content` - Get learning content
- `POST /community/challenges` - Create peer challenge

### Government Schemes
- `GET /schemes` - List government schemes
- `GET /schemes/eligible` - Get eligible schemes for user
- `GET /schemes/{scheme_id}` - Get scheme details

### Savings & Goals
- `GET /savings/goals` - List user goals
- `POST /savings/goals` - Create new goal
- `POST /savings/transactions` - Record transaction
- `GET /savings/progress` - Get savings progress

### Dashboard
- `GET /dashboard/financial-score` - Get financial score
- `GET /dashboard/cultural-nudges` - Get cultural nudges
- `GET /dashboard/analytics` - Get user analytics

## 🌍 Multilingual Support

### Supported Languages

- English (en)
- Hindi (hi) - हिंदी
- Tamil (ta) - தமிழ்
- Telugu (te) - తెలుగు
- Bengali (bn) - বাংলা
- Gujarati (gu) - ગુજરાતી
- Kannada (kn) - ಕನ್ನಡ
- Malayalam (ml) - മലയാളം
- Marathi (mr) - मराठी
- Punjabi (pa) - ਪੰਜਾਬੀ
- Odia (or) - ଓଡ଼ିଆ
- Assamese (as) - অসমীয়া
- Urdu (ur) - اردو
- Nepali (ne) - नेपाली
- Sinhala (si) - සිංහල

### Voice Features

- **Text-to-Speech** - Convert responses to audio in user's language
- **Speech-to-Text** - Process voice commands in multiple languages
- **Language Detection** - Automatic language detection from text
- **Cultural Context** - Language-specific financial advice

## 🤖 AI Features

### Cultural Nudges

- **Festival-based** - Savings advice for Diwali, Eid, Christmas, etc.
- **Seasonal** - Monsoon emergency funds, wedding season planning
- **Life Events** - Marriage, education, retirement planning
- **Regional** - State-specific schemes and opportunities

### Financial Scoring

- **Savings Score** - Based on savings rate and consistency
- **Investment Score** - Portfolio diversification and risk management
- **Goal Achievement** - Progress towards financial goals
- **Scheme Utilization** - Usage of government schemes
- **Community Engagement** - Participation in learning circles

### Investment Filters

- **Halal Investments** - Sharia-compliant options
- **Jain Principles** - Non-violence aligned investments
- **Vegetarian Lifestyle** - Cruelty-free investment options
- **Traditional Values** - Conservative investment approaches

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# Run with coverage
pytest --cov=. tests/
```

### Test Data

The `init_db.py` script creates test data including:
- Sample government schemes
- Learning content in multiple languages
- Community circles
- Local agents
- Cultural nudges
- Investment filters

## 📊 Monitoring & Logging

### Logs

- **Location**: `logs/fintwin.log`
- **Rotation**: 10MB max size, 5 backup files
- **Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL

### Health Check

```bash
curl http://localhost:8000/health
```

### Metrics

- API response times
- Database query performance
- User engagement metrics
- Voice interaction success rates

## 🚀 Deployment

### Production Setup

1. **Update environment variables**
   ```env
   DEBUG=False
   ENVIRONMENT=production
   DATABASE_URL=postgresql://user:pass@host/db
   SECRET_KEY=your-production-secret-key
   ```

2. **Use production database**
   ```bash
   # PostgreSQL example
   pip install psycopg2-binary
   ```

3. **Run with production server**
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment-specific Configurations

- **Development**: SQLite, debug mode, auto-reload
- **Staging**: PostgreSQL, limited debug, rate limiting
- **Production**: PostgreSQL, no debug, full security, monitoring

## 🔒 Security

### Security Features

- **JWT Tokens** - Secure authentication with expiration
- **Password Hashing** - bcrypt with salt
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Cross-origin request control
- **Input Validation** - Pydantic model validation
- **SQL Injection Protection** - SQLAlchemy ORM

### Security Best Practices

1. **Change default credentials**
2. **Use strong secret keys**
3. **Enable HTTPS in production**
4. **Regular security updates**
5. **Monitor API usage**
6. **Implement proper logging**

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Make changes and test**
4. **Submit pull request**

### Code Style

- **PEP 8** - Python style guide
- **Type Hints** - Use type annotations
- **Docstrings** - Document functions and classes
- **Comments** - Explain complex logic

### Adding New Features

1. **Update models** - Add database models if needed
2. **Create schemas** - Define Pydantic models
3. **Implement endpoints** - Add FastAPI routes
4. **Add tests** - Write comprehensive tests
5. **Update documentation** - Update README and API docs

## 📞 Support

### Common Issues

1. **Database connection errors**
   - Check DATABASE_URL in .env
   - Ensure database file permissions

2. **API key errors**
   - Verify OpenAI API key
   - Check Google Cloud API configuration

3. **Voice service issues**
   - Ensure audio format compatibility
   - Check internet connection for cloud services

4. **CORS errors**
   - Update ALLOWED_ORIGINS in .env
   - Check frontend URL configuration

### Getting Help

- **Documentation**: Check API docs at `/docs`
- **Logs**: Check `logs/fintwin.log` for errors
- **Issues**: Create GitHub issue with details
- **Community**: Join our Discord/Slack channel

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **OpenAI** - AI-powered features
- **Google Cloud** - Voice services
- **SQLAlchemy** - Database ORM
- **Government of India** - Scheme data and APIs
- **Community Contributors** - Feature requests and feedback

---

**FinTwin+** - Empowering Financial Inclusion Through Technology 🚀