# 🏥 Prescription Recognition App

AI-powered handwritten prescription recognition using **Llama 4 Scout (via Groq)**.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js + TypeScript
- **AI Model:** `meta-llama/llama-4-scout-17b-16e-instruct` (via Groq API)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API Key

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```
GROQ_API_KEY=your_key_here
```

### 3. Run in development

```bash
npm run dev
```

This starts both the Express backend (port 3001) and Vite dev server concurrently.

Open **http://localhost:5173** (or the URL provided by Vite) in your browser.

### 4. Build & deploy for production

```bash
npm run build
npm start
```

This builds the React app and serves everything from the Express server on port 3001.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze prescription via base64 image in JSON body |
| POST | `/api/analyze-upload` | Analyze prescription via multipart file upload |

### Example cURL

```bash
curl -X POST http://localhost:3001/api/analyze-upload \
  -F "image=@prescription.jpg"
```

## Project Structure

```
├── server/            # Express backend
│   └── index.ts       # API server with Groq integration
├── src/               # React frontend
│   ├── components/    # UI components
│   ├── App.tsx        # Main app
│   └── index.css      # Tailwind + theme
├── .env.example       # Environment template
└── package.json       # Scripts & dependencies
```
