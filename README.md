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

## Quick Setup (Recommended)

### For macOS/Linux:

1. Clone the repository:

```bash
git clone https://github.com/sumitdotml/chat-with-gemini.git
cd chat-with-gemini
```

2. Run the installation script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. Add your Gemini API key to the `.env` file in the backend directory (get your API key [here](https://ai.google.dev/gemini-api/docs/api-key)).

```bash
cd backend
```

The `.env` file should look like this:

```bash
GEMINI_API_KEY=your_api_key_here # should be a long string of characters
```

4. Start the application:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

### For Windows:

1. Clone the repository:
   ```bash
   git clone https://github.com/sumitdotml/chat-with-gemini.git
   cd chat-with-gemini
   ```   
2. Run the installation script:
   ```bash
   install.bat
   ```
3. Start the application:
   ```bash
   run.bat
   ```

The installation script will:
- Install frontend dependencies
- Set up the Python virtual environment
- Install backend dependencies
- Prompt you for your Gemini API key

The run script will:
- Start the backend server on http://localhost:8000
- Start the frontend on http://localhost:3000

You can also run just the backend or frontend:
```bash
# macOS/Linux
./run.sh backend
./run.sh frontend

# Windows
run.bat backend
run.bat frontend
```

---

## Manual Setup Instructions

If you prefer to set up manually, follow these steps:

### 1. Backend Setup

```bash
cd backend
```

Create and activate virtual environment

```bash
python -m venv .venv
source .venv/bin/activate # On Windows: .venv\Scripts\activate
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

## Conversation Data Storage

### Where are conversations saved?

This application stores conversation data in two different ways depending on which interface you're using:

1. **Next.js Web Interface**: 
   - Conversations are stored in your browser's localStorage
   - The data is saved under the key "chat-conversations"
   - This data persists between browser sessions but is limited to the browser you're using
   - Data is stored locally on your device and not sent to any remote servers (except for the actual messages sent to the Gemini API)

2. **Streamlit Interface**:
   - Conversations are stored as JSON files in the `/conversations` directory
   - Each conversation is saved as a separate file with the conversation ID as the filename
   - These files contain the full conversation history including all messages

### Privacy and Data Security

- All conversation data is stored locally on your device
- The `.gitignore` file is configured to exclude conversation data from being pushed to remote repositories
- The following directories are excluded from git (in case you're using the streamlit interface):
  - `/conversations/` - Contains Streamlit conversation files
  - `/logs/` - Contains application logs
  - `localStorage/` - For any exported browser localStorage data

If you want to completely remove your conversation history:
- For the Next.js interface: Clear your browser's localStorage (inspect element -> application -> storage -> Local storage -> right click on localhost:3000 -> clear) or use the "X" button in the sidebar
- For the Streamlit interface: Delete the files in the `/conversations` directory

---

## Contributing

Feel free to submit issues and pull requests!

---

## License

MIT
