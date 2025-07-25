# Google Cloud Speech-to-Text API Integration

FinTwin+ now supports Google Cloud Speech-to-Text API for enhanced speech recognition accuracy and better language support.

## Setup Instructions

### 1. Get Google Cloud API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Speech-to-Text API**
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > API Key**
6. Copy the generated API key

### 2. Configure the API Key

Add your Google Cloud API key to the `.env` file in the backend directory:

```env
# Replace 'your-google-cloud-api-key-here' with your actual API key
GOOGLE_CLOUD_API_KEY=your-actual-api-key-here
```

### 3. API Behavior

- **With API Key**: Uses Google Cloud Speech-to-Text API (higher accuracy, better language support)
- **Without API Key**: Falls back to free Google Speech Recognition API
- **Automatic Fallback**: If Cloud API fails, automatically switches to free API

## Features

### Enhanced Accuracy
- Higher transcription accuracy compared to free API
- Better handling of accents and dialects
- Improved noise reduction

### Language Support
Supports all 15+ Indian languages:
- English (en-US)
- Hindi (hi-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Bengali (bn-IN)
- Gujarati (gu-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Marathi (mr-IN)
- Punjabi (pa-IN)
- Odia (or-IN)
- Assamese (as-IN)
- Urdu (ur-IN)
- Nepali (ne-NP)
- Sinhala (si-LK)

### Advanced Features
- Automatic punctuation
- Enhanced model for better accuracy
- Confidence scores
- Word-level timestamps (configurable)

## API Endpoints

### Check API Status
```http
GET /voice/api-status
```

Returns information about which speech APIs are available:
```json
{
  "google_cloud_speech_api": {
    "available": true,
    "status": "configured"
  },
  "google_free_speech_api": {
    "available": true,
    "status": "available"
  },
  "primary_api": "google_cloud",
  "supported_languages": ["en", "hi", "ta", "te", "bn", "gu", "kn", "ml", "mr", "pa"]
}
```

### Test Speech-to-Text
```http
POST /voice/speech-to-text
```

Request body:
```json
{
  "audio_data": "base64-encoded-audio-data",
  "language": "en",
  "audio_format": "wav"
}
```

Response:
```json
{
  "transcribed_text": "Hello, how can I help you today?",
  "confidence": 0.95,
  "language": "en",
  "success": true,
  "api_used": "google_cloud",
  "error": null
}
```

## Cost Considerations

### Google Cloud Speech-to-Text Pricing
- First 60 minutes per month: **FREE**
- After 60 minutes: $0.006 per 15-second increment
- Enhanced models: $0.009 per 15-second increment

### Free API Limitations
- Rate limited
- Lower accuracy
- No advanced features
- Dependent on Google's free service availability

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** for API key storage
3. **Restrict API key usage** in Google Cloud Console:
   - Limit to specific APIs (Cloud Speech-to-Text)
   - Restrict by IP address if possible
   - Set usage quotas

## Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Check if `GOOGLE_CLOUD_API_KEY` is set in `.env`
   - Restart the backend server after adding the key

2. **"Cloud Speech API error: 403"**
   - Verify API key is correct
   - Ensure Cloud Speech-to-Text API is enabled in Google Cloud Console
   - Check API key restrictions

3. **"Cloud Speech API error: 400"**
   - Check audio format and encoding
   - Ensure audio data is properly base64 encoded
   - Verify language code is supported

4. **Fallback to free API**
   - Check server logs for specific error messages
   - Verify internet connectivity
   - Check Google Cloud service status

### Testing the Integration

1. Start the backend server:
   ```bash
   cd backend
   python main.py
   ```

2. Check API status:
   ```bash
   curl http://localhost:8000/voice/api-status
   ```

3. Test with the voice assistant in the frontend application

## Benefits of Cloud Speech API

1. **Higher Accuracy**: Up to 95%+ accuracy vs 80-85% with free API
2. **Better Language Support**: Enhanced models for Indian languages
3. **Noise Handling**: Superior background noise filtering
4. **Punctuation**: Automatic punctuation insertion
5. **Reliability**: Enterprise-grade service with 99.9% uptime SLA
6. **Scalability**: Handles high-volume requests efficiently

## Migration Notes

- **Backward Compatible**: Existing voice features continue to work
- **Automatic Fallback**: No service interruption if Cloud API is unavailable
- **Gradual Rollout**: Can be enabled/disabled via environment variable
- **No Frontend Changes**: All improvements are transparent to the frontend