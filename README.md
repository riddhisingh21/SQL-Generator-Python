# AI-Powered SQL Generator

A modern web application that transforms natural language into optimized SQL queries using Google's Gemini AI, with secure user authentication and data management.

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

### 1. Clone and Install
```bash
git clone <repository-url>
cd sql-generator
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Authentication Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

### 3. Setup Services
- **Gemini API**: Follow instructions in `GEMINI_SETUP.md`
- **Clerk Auth**: Follow instructions in `CLERK_SETUP.md`

### 4. Start Development Server
```bash
npm run dev
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

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Authentication**: Clerk
- **AI**: Google Gemini API
- **Routing**: React Router
- **Storage**: User-specific localStorage

## 📖 Setup Guides

- [Gemini API Setup](./GEMINI_SETUP.md) - Configure AI-powered query generation
- [Clerk Authentication Setup](./CLERK_SETUP.md) - Set up user authentication

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API and storage services
├── context/            # React contexts (theme, etc.)
└── main.jsx           # Application entry point
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
