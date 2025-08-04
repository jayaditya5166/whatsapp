# Backend Structure & Features

This backend is being refactored to support:

- Express.js REST API (controllers, models, routes, services, utils)
- MongoDB (Mongoose models for leads, messages, reminders)
- Google Sheets sync (periodic lead ingestion)
- WhatsApp automation (wweb.js)
- OpenAI GPT-4 integration (smart replies, lead scoring)
- Docker support

# WhatsApp Autoresponder with AI Lead Qualification

A sophisticated WhatsApp autoresponder system for IT companies that automatically qualifies leads and provides intelligent responses using Groq AI.

## 🚀 Features

- **AI-Powered Responses**: Uses Groq AI for intelligent conversation handling
- **Lead Qualification**: Automatically categorizes leads into 8 different stages
- **IT Company Knowledge Base**: Complete service catalog with pricing
- **Media Handling**: Supports images and PDFs
- **Lead Tracking**: Comprehensive conversation history and stage progression
- **Real-time Console Updates**: Detailed lead status information

## 📋 Prerequisites

- Node.js (v16 or higher)
- WhatsApp account
- Groq API key

## 🛠️ Installation

1. **Clone or download the project**
2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

   Get your Groq API key from: https://console.groq.com/

4. **Create downloads directory:**
   ```bash
   mkdir downloads
   ```

## 🚀 Usage

1. **Start the application:**

   ```bash
   npm start
   ```

2. **Scan the QR code** with your WhatsApp mobile app

3. **Start receiving messages** - the system will automatically:
   - Qualify leads based on conversation content
   - Provide stage-appropriate responses
   - Track lead progression
   - Display detailed console updates

## 📊 Lead Stages

The system automatically categorizes leads into these stages:

1. **INITIAL_CONTACT** - First contact, gathering information
2. **SERVICE_INQUIRY** - Asking about services and pricing
3. **BUDGET_DISCUSSION** - Financial considerations
4. **TIMELINE_INQUIRY** - Project deadlines
5. **TECHNICAL_REQUIREMENTS** - Technical specifications
6. **MEETING_REQUEST** - Requesting consultations
7. **READY_TO_PROCEED** - Ready to start project
8. **FOLLOW_UP_NEEDED** - Needs follow-up

## 🏢 Company Information

**TechSolutions Pro** - Leading IT solutions provider

- **Services**: Web Development, Mobile Apps, Cloud Services, Digital Transformation
- **Pricing**: $3K-$100K+ depending on service and complexity
- **Timeline**: 2 weeks to 6 months depending on project scope

## 📁 Project Structure

```
whatsappautoresponder/
├── index.js              # Main application file
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create this)
├── downloads/            # Media files storage
└── README.md            # This file
```

## 🔧 Configuration

### Customizing Company Information

Edit the `IT_COMPANY_KNOWLEDGE` object in `index.js` to match your company:

- Company details
- Services and pricing
- Contact information

### Adjusting Lead Stages

Modify the `LEAD_STAGES` object to customize:

- Keywords for stage detection
- Stage descriptions
- Qualification criteria

## 🐛 Troubleshooting

### Common Issues:

1. **"Cannot find module" errors:**

   - Run `npm install` to install dependencies

2. **Authentication issues:**

   - Make sure your `.env` file has the correct `GROQ_API_KEY`

3. **WhatsApp connection issues:**

   - Ensure your phone has internet connection
   - Try restarting the application

4. **Media download errors:**
   - Ensure the `downloads` directory exists
   - Check file permissions

## 📝 License

MIT License - feel free to modify and use for your business needs.

## 🤝 Support

For issues or questions, please check the troubleshooting section above or create an issue in the repository.
