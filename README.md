# CalHacks Full-Stack Web Application

A modern full-stack web application built for CalHacks with React frontend, Express.js backend, and Supabase authentication.

## 🚀 Features

- **Frontend**: React 18 with Vite for fast development
- **Backend**: Express.js with RESTful API
- **Authentication**: Supabase integration with email/password and OAuth
- **Styling**: Tailwind CSS for modern UI
- **State Management**: React Context for authentication
- **Routing**: React Router for client-side navigation
- **Development**: Hot reload for both client and server

## 📁 Project Structure

```
CalHacks/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Auth/       # Authentication components
│   │   │   └── LoadingScreen.jsx
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── lib/           # Utilities and configurations
│   │   │   └── supabase.js
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/      # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express.js backend
│   ├── server.js          # Main server file
│   └── package.json
├── .gitignore
├── package.json           # Root package.json with scripts
├── setup-env.js          # Environment setup script
├── start.sh              # Unix start script
├── start.bat              # Windows start script
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/NathanG2022/CalHacks.git
cd CalHacks
```

### 2. Install Dependencies

```bash
# Install all dependencies (client + server)
npm run install:all

# Or install separately
npm install                    # Root dependencies
cd client && npm install      # Client dependencies
cd ../server && npm install   # Server dependencies
```

### 3. Environment Setup

#### Automatic Setup

Run the setup script to create environment files:

```bash
node setup-env.js
```

#### Manual Setup

**Client Environment**

Copy the example environment file and configure it:

```bash
cp client/env.example client/.env.local
```

Edit `client/.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
VITE_API_URL=http://localhost:3001
```

**Server Environment**

```bash
cp server/env.example server/.env
```

Edit `server/.env`:

```env
PORT=3001
```

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy your project URL and anon key
4. Update your `client/.env.local` file with these values
5. Enable authentication providers in Supabase dashboard:
   - Email/Password authentication
   - OAuth providers (Google, Microsoft, etc.)

### 5. Start Development

```bash
# Start both client and server
npm run dev

# Or start separately
npm run client:dev    # Client only (port 5173)
npm run server:dev   # Server only (port 3001)

# Or use the start scripts
./start.sh           # Unix
start.bat            # Windows
```

## 📚 Available Scripts

### Root Scripts

- `npm run dev` - Start both client and server
- `npm run install:all` - Install all dependencies
- `npm run build` - Build for production

### Client Scripts

- `npm run client:dev` - Start Vite development server
- `npm run client:build` - Build client for production

### Server Scripts

- `npm run server:dev` - Start server with nodemon
- `npm run server:start` - Start server normally

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Items API
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Authentication API
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

## 🎨 UI Components

### Authentication
- **SignIn**: Email/password login with OAuth options
- **SignUp**: User registration with validation
- **AuthContext**: Global authentication state management

### Pages
- **Dashboard**: Main application dashboard with todo items
- **Profile**: User profile management
- **Settings**: Application settings

## 🔐 Authentication Flow

1. **Supabase First**: Primary authentication through Supabase
2. **Backend Fallback**: Falls back to backend API if Supabase fails
3. **OAuth Support**: Google and Microsoft OAuth integration
4. **Session Management**: Automatic token refresh and session handling

## 🚀 Deployment

### Client Deployment

```bash
cd client
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Server Deployment

```bash
cd server
npm start
# Deploy to your server platform (Heroku, Railway, etc.)
```

## 🛡️ Security Features

- Environment variable protection
- CORS configuration
- Input validation
- Secure authentication flow
- Protected API routes

## 📝 Development Notes

- **Hot Reload**: Both client and server support hot reload
- **Environment Variables**: Use `.env.local` for client, `.env` for server
- **API Communication**: Client communicates with server via REST API
- **Error Handling**: Comprehensive error handling throughout the app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the console for errors
2. Verify environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Check that all dependencies are installed

For more help, please open an issue in the repository.

## 🎯 CalHacks Specific Features

This application is specifically designed for CalHacks with:

- **CalHacks Branding**: Custom styling and branding
- **Todo Management**: Task management for hackathon projects
- **Real-time Updates**: Live server status monitoring
- **Quick Setup**: Easy environment configuration
- **Scalable Architecture**: Ready for team collaboration

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

## 📊 Project Status

✅ **Complete Full-Stack Application**
- React frontend with modern tooling
- Express.js backend with RESTful API
- Supabase authentication integration
- Tailwind CSS styling
- Development environment configured
- Ready for deployment

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NathanG2022/CalHacks.git
   cd CalHacks
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment:**
   ```bash
   node setup-env.js
   ```

4. **Configure Supabase:**
   - Create a Supabase project
   - Update `client/.env.local` with your credentials

5. **Start development:**
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

Happy coding! 🎉

