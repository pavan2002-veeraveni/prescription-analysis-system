# Codebase Overview

This document provides a high-level overview of the application architecture and key components.

## Architecture

The project is a monorepo-style full-stack application for analyzing handwritten prescriptions.
- **Frontend**: A React application built with TypeScript and Vite. It uses Tailwind CSS for styling.
- **Backend**: An Express.js API server written in TypeScript. It integrates with the Groq API to analyze prescription images.

Both are managed via a single `package.json` at the root and can be run concurrently during development using `npm run dev`.

## Directory Structure

- **`src/`**: Contains the frontend application code.
  - **`components/`**: Reusable React components (e.g., `HeroSection.tsx`, `ProcessingState.tsx`, which handle the user interface for uploading and analyzing prescriptions).
  - **`App.tsx`**: The main root component for the application.
  - **`index.tsx`** / **`main.tsx`**: The React entry point.
  - **`index.css`**: Global stylesheet including Tailwind directives.
- **`server/`**: Contains the backend code.
  - **`index.ts`**: The main Express server file. It sets up routes, configures Multer for file uploads, and integrates the Groq SDK (`groq-sdk`) to interact with the LLM (`meta-llama/llama-4-scout-17b-16e-instruct`) for extracting medications from prescription images.
- **Root Files**:
  - **`package.json`**: Defines scripts for building, running dev servers, and managing dependencies for both frontend and backend.
  - **`vite.config.ts`**: Configuration for Vite, used to build the frontend.
  - **`tsconfig.json`**: TypeScript configuration.
  - **`tailwind.config.ts`**: Configuration for Tailwind CSS.
  - **`.env` / `.env.example`**: Environment variables configuration files (requires `GROQ_API_KEY`).

## Key Dependencies

- **Frontend**: `react`, `react-dom`, `tailwindcss`, `lucide-react`, `vite`, `typescript`.
- **Backend**: `express`, `cors`, `multer` (for handling multipart/form-data), `groq-sdk` (for communicating with Groq's LLM APIs), `dotenv`.

## Data Flow

1. **User Upload**: The user uploads an image of a prescription via the React frontend.
2. **API Request**: The frontend sends the image to the backend Express server, either as a base64 encoded string (`/api/analyze`) or as a multipart form data upload (`/api/analyze-upload`).
3. **AI Processing**: The Express server formats the image along with a detailed `systemPrompt` and sends a request to the Groq API using the `meta-llama/llama-4-scout-17b-16e-instruct` vision model.
4. **Response Parsing**: The Groq model returns a structured JSON response containing extracted medications, dosages, frequencies, duration, and instructions. The backend extracts and parses this JSON.
5. **Display Results**: The backend sends the parsed JSON back to the frontend, which then displays the extracted information to the user in a readable interface.
