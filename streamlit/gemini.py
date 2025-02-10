from dotenv import load_dotenv
import os
import streamlit as st
import google.generativeai as genai
import json
from datetime import datetime
import pyperclip
import uuid
from pathlib import Path

# Load environment variables and configure
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure the page with wider layout and custom styles
st.set_page_config(page_title="Chat with Gemini", page_icon="💭", layout="wide")

# Custom CSS
st.markdown(
    """
<style>
    /* Force main container to respect width */
    .main .block-container {
        max-width: 800px !important;
        padding-left: 2rem !important;
        padding-right: 2rem !important;
        padding-top: 2rem !important;
        padding-bottom: 3rem !important;
    }

    /* Override Streamlit's default content width */
    .css-1y4p8pa {
        max-width: 800px !important;
        padding: 0 !important;
    }
    
    /* Strict sidebar button styling */
    [data-testid="stSidebar"] [data-testid="stButton"] {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    [data-testid="stSidebar"] [data-testid="stButton"] > button {
        width: 100% !important;
        margin: 0 !important;
        padding: 0.5rem 1rem !important;
        border: none !important;
        background: none !important;
        color: rgba(255, 255, 255, 0.8) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
    }
    
    [data-testid="stSidebar"] [data-testid="stButton"] button > div {
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 0.5rem !important;
    }

    [data-testid="stSidebar"] [data-testid="stButton"] button p {
        text-align: left !important;
        width: 100% !important;
    }
    
    /* Chat input container */
    .stChatInputContainer {
        position: fixed !important;
        bottom: 40px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: min(800px, calc(100% - 4rem)) !important;
        max-width: 800px !important;
        background-color: rgba(240, 242, 246, 0.05) !important;
        border-radius: 15px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        padding: 15px !important;
        backdrop-filter: blur(10px) !important;
        z-index: 999 !important;
    }
    
    /* Source code link container */
    .source-code-container {
        position: fixed !important;
        bottom: 10px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: min(800px, calc(100% - 4rem)) !important;
        max-width: 800px !important;
        text-align: center !important;
        z-index: 998 !important;
    }
    
    /* Ensure chat messages stay within width */
    .stChatMessage {
        max-width: 800px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        margin-bottom: 1.5rem !important;
    }
    
    /* Force content width when sidebar is collapsed */
    [data-testid="stSidebar"][aria-expanded="false"] ~ .main .block-container {
        max-width: 800px !important;
        padding-left: 2rem !important;
        padding-right: 2rem !important;
    }
</style>
""",
    unsafe_allow_html=True,
)

# Configure the API
genai.configure(api_key=GEMINI_API_KEY)


# Initialize Gemini
@st.cache_resource
def get_client():
    return genai.GenerativeModel("gemini-pro")


# Create a conversations directory if it doesn't exist
CONVERSATIONS_DIR = Path("conversations")
CONVERSATIONS_DIR.mkdir(exist_ok=True)


# Add this function near the top of the file (after imports)
def cleanup_empty_conversations():
    """Clean up empty conversation files and session state"""
    # Get list of conversation IDs to remove
    to_remove = []
    for conv_id, conv in st.session_state.conversations.items():
        if not conv["messages"]:  # If conversation has no messages
            # Remove the file if it exists
            file_path = CONVERSATIONS_DIR / f"{conv_id}.json"
            if file_path.exists():
                file_path.unlink()  # Delete the file
            to_remove.append(conv_id)

    # Remove empty conversations from session state
    for conv_id in to_remove:
        del st.session_state.conversations[conv_id]


# Initialize conversations in session state
if "conversations" not in st.session_state:
    st.session_state.conversations = {}
    # Load only non-empty conversations from files
    for file in CONVERSATIONS_DIR.glob("*.json"):
        with open(file, "r") as f:
            conversation = json.load(f)
            if conversation.get("messages"):  # Only load if it has messages
                st.session_state.conversations[conversation["id"]
                                               ] = conversation

if "current_conversation_id" not in st.session_state:
    # Create a new conversation if none exists
    new_id = str(uuid.uuid4())
    st.session_state.conversations[new_id] = {
        "id": new_id,
        "title": "New Conversation",
        "messages": [],
        "timestamp": datetime.now().isoformat(),
    }
    st.session_state.current_conversation_id = new_id

# Modify sidebar to show conversation list
with st.sidebar:
    # Replace the two columns with a single button
    if st.button(
        "New Chat", key="new_chat_button", use_container_width=True, type="primary"
    ):
        # Clean up empty conversations first
        cleanup_empty_conversations()

        # Create new conversation
        new_id = str(uuid.uuid4())
        st.session_state.conversations[new_id] = {
            "id": new_id,
            "title": "New Conversation",
            "messages": [],
            "timestamp": datetime.now().isoformat(),
        }
        # Update current conversation ID
        st.session_state.current_conversation_id = new_id
        # Clear current messages
        if "messages" in st.session_state:
            st.session_state.messages = []
        # Reset chat session
        st.session_state.chat_session = get_client()
        # Save the new conversation to file
        with open(CONVERSATIONS_DIR / f"{new_id}.json", "w") as f:
            json.dump(st.session_state.conversations[new_id], f)
        # Force complete page rerun
        st.rerun()

    # Add some space
    st.markdown("<br>", unsafe_allow_html=True)

    # Conversation list with improved styling and dropdown menu
    for conv_id, conv in sorted(
        st.session_state.conversations.items(),
        key=lambda x: x[1]["timestamp"],
        reverse=True,
    ):
        if conv["messages"]:
            title = (
                conv["messages"][0]["content"][:40] + "..."
                if len(conv["messages"][0]["content"]) > 40
                else conv["messages"][0]["content"]
            )

            # Container for conversation item
            cols = st.columns([0.85, 0.15])

            # Main conversation button
            with cols[0]:
                if st.button(
                    f"{'💬 ' if conv_id != st.session_state.current_conversation_id else '🔹 '}{title}",
                    key=f"conv_{conv_id}",
                    use_container_width=True,
                    type=(
                        "primary"
                        if conv_id == st.session_state.current_conversation_id
                        else "secondary"
                    ),
                ):
                    st.session_state.current_conversation_id = conv_id
                    st.rerun()

            # Three dots menu
            with cols[1]:
                if st.button("×", key=f"delete_{conv_id}", help="Delete conversation"):
                    # Delete conversation logic
                    conv_file = CONVERSATIONS_DIR / f"{conv_id}.json"
                    if conv_file.exists():
                        conv_file.unlink()
                    del st.session_state.conversations[conv_id]
                    if conv_id == st.session_state.current_conversation_id:
                        remaining_convs = [
                            c
                            for c in st.session_state.conversations.keys()
                            if c != conv_id
                        ]
                        if remaining_convs:
                            st.session_state.current_conversation_id = remaining_convs[
                                0
                            ]
                        else:
                            new_id = str(uuid.uuid4())
                            st.session_state.conversations[new_id] = {
                                "id": new_id,
                                "title": "New Conversation",
                                "messages": [],
                                "timestamp": datetime.now().isoformat(),
                            }
                            st.session_state.current_conversation_id = new_id
                    st.rerun()

    # Get current conversation first
    current_conv = st.session_state.conversations[
        st.session_state.current_conversation_id
    ]

    # Then add settings section
    st.markdown("<hr>", unsafe_allow_html=True)

    # Show total characters if there are messages
    if current_conv["messages"]:
        total_chars = sum(len(m["content"]) for m in current_conv["messages"])
        st.metric("Total Characters", total_chars)

    # Settings section
    st.markdown("### ⚙️ Settings")

    # Create two columns for compact layout
    col1, col2 = st.columns(2)

    # Temperature in first column
    with col1:
        temperature = st.slider(
            "Temperature",
            min_value=0.0,
            max_value=1.0,
            value=0.7,
            step=0.1,
            help="Higher values make the output more creative but less focused",
        )

    # Top-p in second column
    with col2:
        top_p = st.slider(
            "Top-p",
            min_value=0.0,
            max_value=1.0,
            value=0.95,
            step=0.05,
            help="Controls diversity of responses",
        )

    # Max output length - updated to match model's actual limit
    max_tokens = st.slider(
        "Max Output Tokens",
        min_value=100,
        max_value=8192,  # Updated to match model's limit
        value=4096,  # Set a reasonable default
        step=100,
        help="Maximum number of tokens in the response (model limit: 8,192)",
    )

    # Advanced settings in expander
    with st.expander("🔧 Advanced Settings"):
        # Add top-k parameter
        top_k = st.slider(
            "Top-k",
            min_value=1,
            max_value=100,
            value=40,
            step=1,
            help="Limits vocabulary to k most likely tokens",
        )

        # Add candidate count
        candidate_count = st.slider(
            "Candidate Count",
            min_value=1,
            max_value=4,
            value=1,
            step=1,
            help="Number of candidate responses to generate",
        )

        # System message input (hidden by default)
        system_message = st.text_area(
            "System Message",
            value="""You are a knowledgeable and articulate AI assistant. Maintain a natural, conversational tone while providing accurate and thoughtful responses. Aim for clarity and precision in your explanations, using plain language that's easy to understand. Create some sort of opening sentence or two that sets the tone for the conversation. While you can occasionally use an emoji when truly appropriate, prefer clear writing over decorative elements. Structure your responses in a logical way, and feel free to use examples or analogies when they help illustrate complex concepts. Of course, you can be approachable and friendly, but do not try to sound too enthusiastic or casual. Always respond in English, unless the user asks you to respond in a different language.""",
            help="This message helps set the AI's response style",
        )

# Update the messages list to use current conversation
st.session_state.messages = current_conv["messages"]

# Main chat interface
st.title("👾 Chat with Gemini")

# Initialize chat session
if "chat_session" not in st.session_state:
    st.session_state.chat_session = get_client()

if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages with enhanced formatting
for idx, message in enumerate(st.session_state.messages):
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        # Add copy button for each message
        if st.button("📋 Copy", key=f"copy_{idx}"):
            pyperclip.copy(message["content"])
            st.toast("Message copied to clipboard!")

# Modify the chat input section to properly use conversation history
if prompt := st.chat_input("What's on your mind?"):
    # Display user message
    st.chat_message("user").markdown(prompt)
    current_conv["messages"].append({"role": "user", "content": prompt})

    # Update conversation timestamp
    current_conv["timestamp"] = datetime.now().isoformat()

    # Save conversation to file
    with open(CONVERSATIONS_DIR / f"{current_conv['id']}.json", "w") as f:
        json.dump(current_conv, f)

    # Display assistant response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""

        # Format the conversation history properly
        formatted_messages = []

        # Add system message as a user message
        formatted_messages.append(
            {"role": "user", "parts": [{"text": system_message}]})

        # Add all previous messages from the conversation
        for message in current_conv["messages"][
            :-1
        ]:  # Exclude the last message (current prompt)
            role = (
                "user" if message["role"] == "user" else "model"
            )  # Changed from "assistant" to "model"
            formatted_messages.append(
                {"role": role, "parts": [{"text": message["content"]}]}
            )

        # Add the current prompt
        formatted_messages.append(
            {"role": "user", "parts": [{"text": prompt}]})

        # Show loading indicator
        with st.spinner("Thinking..."):
            # Stream the response with full conversation history
            response = st.session_state.chat_session.generate_content(
                contents=formatted_messages,
                stream=True,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    max_output_tokens=max_tokens,
                    candidate_count=candidate_count,
                ),
            )

            for chunk in response:
                full_response += chunk.text
                message_placeholder.markdown(full_response + "▌")
            message_placeholder.markdown(full_response)

        # After getting the response, save it
        current_conv["messages"].append(
            {"role": "model", "content": full_response})
        with open(CONVERSATIONS_DIR / f"{current_conv['id']}.json", "w") as f:
            json.dump(current_conv, f)

        # If this was the first message exchange, trigger a rerun to update sidebar
        if len(current_conv["messages"]) == 2:  # User message + AI response
            st.rerun()

    # Clean up any empty conversations
    cleanup_empty_conversations()
