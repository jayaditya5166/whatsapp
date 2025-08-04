# WhatsApp Autoresponder - Multi-Tenant System

A comprehensive WhatsApp autoresponder system with AI-powered lead qualification, multi-tenant architecture, and real-time messaging capabilities.

## 🚀 Features

- **Multi-Tenant Architecture**: Separate WhatsApp sessions for each business
- **AI-Powered Responses**: Groq AI integration for intelligent lead qualification
- **Real-Time Updates**: Socket.IO for live lead updates and WhatsApp status
- **Lead Management**: Complete CRM with lead stages and follow-ups
- **Google Sheets Integration**: Sync leads with Google Sheets
- **Subscription Plans**: Tiered pricing with usage limits
- **Admin Dashboard**: Super admin panel for tenant management

## 📁 Project Structure

```
whatsappautoresponder/
├── backend/                 # Backend API (Node.js/Express)
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/               # Frontend (React)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── public/             # Static files
└── README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **WhatsApp Web.js** for WhatsApp integration
- **Groq AI** for intelligent responses
- **JWT** for authentication

### Frontend
- **React.js** with React Router
- **Bootstrap** for styling
- **Socket.IO Client** for real-time updates
- **Axios** for API calls

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository to Render
2. Set environment variables
3. Deploy as Web Service

### Frontend (Netlify Drop)
1. Build the React app
2. Drag and drop build folder to Netlify

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-netlify-app.netlify.app
GROQ_API_KEY=your_groq_api_key
```

### Frontend (.env)
```env
REACT_APP_API_BASE=https://your-render-app.onrender.com/api
REACT_APP_SOCKET_URL=https://your-render-app.onrender.com
```

## 📋 Setup Instructions

### Local Development
1. Clone the repository
2. Install dependencies: `npm install` in both backend and frontend
3. Set up environment variables
4. Start backend: `npm start` in backend directory
5. Start frontend: `npm start` in frontend directory

### Production Deployment
1. Push code to GitHub
2. Deploy backend to Render
3. Build frontend: `npm run build`
4. Deploy frontend to Netlify Drop

## 🔐 Security Notes

- All sensitive data is stored in environment variables
- JWT tokens for authentication
- CORS properly configured for production
- WhatsApp sessions stored securely

## 📞 Support

For deployment issues or questions, check the deployment guide in the docs folder.

## 📄 License

MIT License - see LICENSE file for details. 