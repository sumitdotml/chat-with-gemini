# Gemini Chat App (Streamlit)

This was just a simple test to see if I could get the Gemini API to work with Streamlit.

This has no relation to this Gemini Chat App project.

If you want a quick way to get a working version of Gemini without having to deal with all the Next.js and FastAPI stuff, you can use this. 

What both the project and this standalone python file in this directory do is the same thing, just the other being a bit more polished and having more features.

In order to use this gemini.py file in this directory, you need to basically:

1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
```

2. Install the necessary packages

```bash
pip install google-generativeai, streamlit, pyperclip, pathlib, python-dotenv
```

3. Create a .env file (under the same directory as this file) and add your Gemini API key

```bash
GEMINI_API_KEY=your_api_key_here
```

4. Run the app with `streamlit run gemini.py`

And that's it!