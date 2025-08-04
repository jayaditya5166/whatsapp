# 🚀 Deployment Guide - WhatsApp Autoresponder

This guide will help you deploy your WhatsApp Autoresponder to production using Render (Backend) and Netlify Drop (Frontend).

## 📋 Prerequisites

1. **GitHub Account** - For code repository
2. **Render Account** - For backend deployment
3. **Netlify Account** - For frontend deployment
4. **MongoDB Atlas Account** - For database
5. **Groq API Key** - For AI features (optional)

## 🔧 Step 1: Prepare Your Code

### 1.1 Update URLs in Frontend

**File: `frontend/src/services/api.js`**
```javascript
const API_BASE = process.env.REACT_APP_API_BASE || "https://your-render-app-name.onrender.com/api";
```

**File: `frontend/src/components/WhatsAppConnect.js`**
```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://your-render-app-name.onrender.com";
```

**File: `frontend/src/components/LeadsTable.js`**
```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://your-render-app-name.onrender.com";
```

### 1.2 Update CORS in Backend

**File: `backend/server.js`**
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        "https://your-netlify-app.netlify.app",
        "https://your-netlify-app-name.netlify.app"
      ]
    : ["http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 2.2 Deploy to Render

1. **Go to [Render.com](https://render.com)**
2. **Sign up/Login with GitHub**
3. **Click "New Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**

   - **Name**: `whatsapp-autoresponder-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

6. **Set Environment Variables:**

   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.ymjjzie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_super_secret_jwt_key_here
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   GROQ_API_KEY=your_groq_api_key_here
   ```

7. **Click "Create Web Service"**
8. **Wait for deployment (5-10 minutes)**
9. **Note your Render URL** (e.g., `https://your-app-name.onrender.com`)

## 🌐 Step 3: Deploy Frontend to Netlify Drop

### 3.1 Build Frontend

```bash
cd frontend
npm install
npm run build
```

### 3.2 Update URLs with Your Render URL

Replace all instances of `your-render-app-name.onrender.com` with your actual Render URL in:

- `frontend/src/services/api.js`
- `frontend/src/components/WhatsAppConnect.js`
- `frontend/src/components/LeadsTable.js`

### 3.3 Deploy to Netlify Drop

1. **Go to [Netlify Drop](https://app.netlify.com/drop)**
2. **Drag and drop your `frontend/build` folder**
3. **Wait for deployment (2-5 minutes)**
4. **Note your Netlify URL** (e.g., `https://your-site-name.netlify.app`)

## 🔄 Step 4: Update CORS and Finalize

### 4.1 Update Backend CORS

1. **Go to your Render service**
2. **Update the `CORS_ORIGIN` environment variable** with your actual Netlify URL
3. **Redeploy the service**

### 4.2 Test Your Application

1. **Visit your Netlify frontend**
2. **Test all features:**
   - Registration/Login
   - WhatsApp connection
   - Lead management
   - Real-time updates
   - Admin dashboard

## ⚠️ Important Notes

### Production Limitations

1. **WhatsApp Sessions**: Will be lost on Render restarts (uses `/tmp` directory)
2. **Chrome Launching**: Won't work on Render (no GUI environment)
3. **File Uploads**: Need cloud storage (AWS S3, etc.)
4. **Background Processes**: May sleep on Render's free tier

### Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, unique secret
3. **MongoDB**: Whitelist Render's IP addresses
4. **CORS**: Only allow your Netlify domain

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Socket.IO Connection**: Verify REACT_APP_SOCKET_URL
3. **MongoDB Connection**: Check IP whitelist and credentials
4. **Build Failures**: Check Node.js version compatibility

### Debug Steps

1. **Check Render logs** for backend errors
2. **Check browser console** for frontend errors
3. **Verify environment variables** are set correctly
4. **Test API endpoints** directly

## 📞 Support

If you encounter issues:

1. Check the Render logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test API endpoints directly using tools like Postman

## 🎉 Success!

Once deployed, your WhatsApp Autoresponder will be available at:
- **Frontend**: `https://your-netlify-app.netlify.app`
- **Backend**: `https://your-render-app.onrender.com`

Your multi-tenant WhatsApp autoresponder system is now live and ready to use! 