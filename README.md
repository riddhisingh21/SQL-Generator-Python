# AI-Powered SQL Generator

A modern full-stack web application that transforms natural language into optimized SQL queries using Google's Gemini AI. Features both React frontend and Python FastAPI backend with secure user authentication and data management.

## ✨ Features

### 🤖 **AI-Powered Query Generation**
- Uses Google's Gemini AI for intelligent SQL generation
- Supports natural language input
- Provides detailed explanations for generated queries
- Multi-dialect support (MySQL, PostgreSQL, SQLite, SQL Server, Oracle)

### 🔐 **Secure Authentication**
- Clerk authentication integration
- Multiple sign-in options (email, social providers)
- User-specific data isolation
- Secure session management

### 📊 **Data Management**
- **Query History**: Save and manage all your generated queries
- **Schema Manager**: Store and reuse database schemas
- **User-Specific Storage**: Each user's data is completely isolated

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Dark/light theme toggle
- Clean, intuitive interface
- Separate pages for different functionalities

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
git clone <repository-url>
cd sql-generator
python start.py
```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

#### 2. Configure Environment Variables
Create `.env.local` for frontend:
```env
# Frontend Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_API_URL=http://localhost:8000
VITE_USE_BACKEND=false  # Set to true to use Python backend
```

Create `.env` for backend:
```env
# Backend Configuration
DATABASE_URL=sqlite:///./sql_generator.db
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here
DEBUG=True
```

#### 3. Setup Services
- **Gemini API**: Follow instructions in `GEMINI_SETUP.md`
- **Clerk Auth**: Follow instructions in `CLERK_SETUP.md`

#### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
npm run dev          # Frontend only
npm run backend      # Backend only
```

## 📱 Application Structure

### Pages
- **Home (`/`)**: Main SQL generator interface
- **History (`/history`)**: Query history management
- **Schemas (`/schemas`)**: Database schema management
- **Authentication**: Sign-in and sign-up pages

### Key Components
- **SQLGenerator**: AI-powered query generation
- **QueryHistory**: Historical query management
- **SchemaManager**: Database schema storage
- **Navigation**: Responsive navigation with user menu

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Authentication**: Clerk
- **Routing**: React Router
- **State Management**: React Context + localStorage

### Backend (Optional)
- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy + PostgreSQL/SQLite
- **AI Integration**: Google Gemini API
- **API Documentation**: Automatic OpenAPI/Swagger docs

### AI & Services
- **Primary AI**: Google Gemini API
- **Fallback**: Template-based SQL generation
- **Architecture**: Dual-mode (frontend-only or full-stack)

## 🏗️ Architecture Modes

This application supports two deployment modes:

### Frontend-Only Mode (Default)
- React app directly calls Gemini API
- No backend server required
- Simpler deployment
- Set `VITE_USE_BACKEND=false`

### Full-Stack Mode
- React frontend + Python FastAPI backend
- Backend handles AI integration
- Database storage for queries and users
- More scalable and secure
- Set `VITE_USE_BACKEND=true`

## 📖 Setup Guides

- [Python Backend Setup](./PYTHON_SETUP.md) - Complete Python backend setup guide
- [Gemini API Setup](./GEMINI_SETUP.md) - Configure AI-powered query generation
- [Clerk Authentication Setup](./CLERK_SETUP.md) - Set up user authentication

## 🔧 Development

### Available Scripts
- `npm run dev` - Start frontend development server
- `npm run backend` - Start Python backend server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `python start.py` - Automated setup and start

### Project Structure
```
├── src/                 # Frontend React application
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API and storage services
│   ├── context/        # React contexts (theme, etc.)
│   └── main.jsx        # Application entry point
├── backend/            # Python FastAPI backend
│   ├── main.py         # FastAPI application
│   ├── models.py       # Database models
│   ├── database.py     # Database configuration
│   ├── config.py       # Application settings
│   └── services/       # Backend services
├── requirements.txt    # Python dependencies
├── package.json        # Node.js dependencies
└── start.py           # Automated setup script
```

## 🔒 Security

- Environment variables are properly configured
- User data is isolated per authenticated user
- Clerk handles all authentication security
- API keys are kept secure in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
