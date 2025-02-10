# Chat with Gemini

A full-stack chat application built with Next.js, FastAPI, and Google's Gemini 2.0 Flash model. Features a modern UI, conversation history, and customizable AI settings.

I just thought I wanted to try this since the Gemini API is free. Work pretty well.

#

## Features

- 💬 Real-time streaming chat responses
- 🔄 Persistent conversation history
- ⚙️ Customizable AI parameters
- 📱 Responsive design
- 🎨 Modern UI with dark mode
- 🔧 Advanced settings for fine-tuning responses

---

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Google Gemini API key ([Get one here](https://ai.google.dev/gemini-api/docs/api-key))

---

## Project Structure

```bash
chat-app/
├── app/ # Next.js frontend
├── backend/ # FastAPI backend
└── README.md
```

---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
```

Create and activate virtual environment

```bash
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create .env file (this ought to be in the root directory of the backend folder)

```bash
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

#

### 2. Frontend Setup

```bash
# In the root directory
npm install
```

#

### 3. Running the Application

1. Start the backend server from the backend folder:

```bash
cd backend
uvicorn main:app --reload
```

2. In a new terminal, start the frontend (this should be in the root directory of our project)

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Configuration

### Environment Variables

Backend (`.env`):

```bash
GEMINI_API_KEY=your_api_key_here
```

#

### AI Settings

Through the settings at the sidebar, you can customize:

- Temperature (0-1): Controls response creativity
- Max Output Tokens (100-8192): Limits response length(8192 is the maximum allowed by the Gemini-2.0-Flash API)
- System Message: Sets AI personality and behavior
- Top-p, Top-k: Advanced response sampling parameters

---

## Development

### Key Files

- `app/page.tsx`: Main chat interface
- `backend/routers/chat.py`: Chat endpoint handler
- `backend/models/gemini.py`: Gemini model integration
- `app/components/Settings.tsx`: AI settings configuration

---

### API Endpoints

- `POST /chat`: Main chat endpoint
  - Accepts: Messages history, prompt, and settings
  - Returns: Server-sent events stream with AI responses

---

## Troubleshooting

1. If you get a 422 error:

   - Ensure your request format matches the expected schema
   - Check if all required fields are present

2. If the backend fails to start:

   - Verify your GEMINI_API_KEY is set correctly
   - Ensure all dependencies are installed

3. If the frontend can't connect:
   - Check if the backend is running on port 8000
   - Verify CORS settings in `backend/main.py`

---

## Streamlit App

If you want to try the Gemini API without all the frontend and backend stuff (just want to test it out quickly), you can use the streamlit app in the [streamlit](./streamlit/) directory.

The setup instructions are in the [README.md](./streamlit/README.md) file of the streamlit directory. Very simple.

---

## Contributing

Feel free to submit issues and pull requests!

---

## License

MIT
