# FinTwin+ - AI-Powered Financial Education Platform

FinTwin+ is a comprehensive financial education platform that combines AI-powered learning, interactive simulations, and personalized financial guidance to help users improve their financial literacy.

## Features

- 🤖 AI-powered voice assistant for financial guidance
- 📚 Interactive financial lessons and tutorials
- 🎯 Personalized financial assessments
- 💰 Savings goals tracking
- 🏛️ Government schemes information
- 👥 Community learning platform
- 📊 Financial simulations

## Tech Stack

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS for styling
- Zustand for state management
- Lucide React for icons

**Backend:**
- FastAPI (Python)
- SQLite database
- Google Cloud Speech API
- Gemini AI integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Deutsche\ Bank\ Hackathon
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up backend:
```bash
cd backend
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
# Copy the example environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your actual API keys
```

### Environment Variables

Create a `backend/.env` file with the following variables:

```env
# Required API Keys
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key-here

# Database
DATABASE_URL=sqlite:///./fintwin.db

# JWT Configuration
SECRET_KEY=your-secret-key-here

# Other configurations (see .env.example for full list)
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python main.py
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Important Security Notes

- **Never commit `.env` files** - They contain sensitive API keys
- **Always use `.env.example`** as a template for required environment variables
- **Set up environment variables** in your deployment platform (Vercel, Netlify, etc.)

### Frontend Deployment (Vercel)

1. Push your code to GitHub (ensure `.env` files are gitignored)
2. Connect your repository to Vercel
3. Deploy automatically

### Backend Deployment

1. Set up your Python environment on your hosting platform
2. Configure environment variables in your hosting platform
3. Install dependencies: `pip install -r requirements.txt`
4. Run the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
