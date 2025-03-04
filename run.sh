#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
UNDERLINE='\033[4m'
NC='\033[0m' # No Color

# Store PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "Stopping backend server (PID: $BACKEND_PID)"
        kill -TERM $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "Stopping frontend server (PID: $FRONTEND_PID)"
        kill -TERM $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}All servers stopped.${NC}"
    # Reset terminal state
    stty sane
    # Clear any remaining input
    read -t 0.1 -n 10000 discard 2>/dev/null
    exit 0
}

# Register the cleanup function for Ctrl+C
trap cleanup SIGINT SIGTERM

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to print a separator line
print_separator() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to start the backend server
start_backend() {
    print_separator
    echo -e "${BOLD}${GREEN}Starting backend server...${NC}"
    print_separator
    cd "$SCRIPT_DIR/backend" || { echo -e "${RED}Backend directory not found.${NC}"; exit 1; }
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        echo -e "${RED}Virtual environment not found. Please run the installation script first.${NC}"
        exit 1
    fi
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo -e "${RED}.env file not found. Please run the installation script first.${NC}"
        exit 1
    fi
    
    # Start the backend server
    echo -e "${YELLOW}Starting FastAPI server on http://localhost:8000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

# Function to start the frontend
start_frontend() {
    print_separator
    echo -e "${BOLD}${GREEN}Starting frontend...${NC}"
    print_separator
    cd "$SCRIPT_DIR" || { echo -e "${RED}Script directory not found.${NC}"; exit 1; }
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}package.json not found. Are you in the right directory?${NC}"
        exit 1
    fi
    
    # Check if node_modules exists or run npm install if it doesn't
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}node_modules not found. Running npm install...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to install frontend dependencies.${NC}"
            exit 1
        fi
    fi
    
    # Start the frontend
    echo -e "${YELLOW}Starting Next.js on http://localhost:3000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    npm run dev
}

# Function to start both frontend and backend in the same terminal
start_both() {
    print_separator
    echo -e "${BOLD}${GREEN}Starting Gemini Chat Application...${NC}"
    print_separator
    echo
    
    # Start backend in the background with logs captured
    cd "$SCRIPT_DIR/backend" || { echo -e "${RED}Backend directory not found.${NC}"; exit 1; }
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        echo -e "${RED}Virtual environment not found. Please run the installation script first.${NC}"
        exit 1
    fi
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo -e "${RED}.env file not found. Please run the installation script first.${NC}"
        exit 1
    fi
    
    # Create a log directory if it doesn't exist
    mkdir -p "$SCRIPT_DIR/logs"
    
    # Start the backend server in background and capture output
    echo -e "${YELLOW}Starting FastAPI backend server on http://localhost:8000${NC}"
    (python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > "$SCRIPT_DIR/logs/backend.log" 2>&1) &
    BACKEND_PID=$!
    
    # Give backend a moment to start
    sleep 2
    
    # Return to root directory and start frontend
    cd "$SCRIPT_DIR" || { echo -e "${RED}Script directory not found.${NC}"; exit 1; }
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}package.json not found. Are you in the right directory?${NC}"
        kill $BACKEND_PID
        exit 1
    fi
    
    # Check if node_modules exists or run npm install if it doesn't
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}node_modules not found. Running npm install...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to install frontend dependencies.${NC}"
            kill $BACKEND_PID
            exit 1
        fi
    fi
    
    echo -e "${YELLOW}Starting Next.js frontend on http://localhost:3000${NC}"
    
    # Print info about how to view backend logs
    echo
    echo -e "${BLUE}Backend server is running in the background.${NC}"
    echo -e "${BLUE}View backend logs at: ${UNDERLINE}./logs/backend.log${NC}"
    echo -e "${BLUE}To monitor backend logs: ${UNDERLINE}tail -f ./logs/backend.log${NC}"
    echo
    
    # Start frontend in foreground
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for frontend to start
    sleep 3
    
    print_separator
    echo -e "${BOLD}${GREEN}✅ GEMINI CHAT IS NOW RUNNING!${NC}"
    print_separator
    echo
    echo -e "${BOLD}${GREEN}🌐 Open your browser and go to: ${UNDERLINE}http://localhost:3000${NC}"
    echo -e "${BOLD}${GREEN}🤖 Start chatting with Gemini!${NC}"
    echo
    echo -e "${BOLD}${YELLOW}⚠️  To stop all servers: Press ${UNDERLINE}Ctrl+C${NC}"
    echo -e "${BOLD}${YELLOW}📋 Or run: ${UNDERLINE}./run.sh stop${NC}"
    echo
    print_separator
    
    # Wait for Ctrl+C
    wait $FRONTEND_PID
}

# Function to display usage information
show_usage() {
    print_separator
    echo -e "${BOLD}${GREEN}Gemini Chat Application - Usage Guide${NC}"
    print_separator
    echo
    echo -e "Usage: $0 [${UNDERLINE}command${NC}]"
    echo
    echo -e "  ${BOLD}${GREEN}backend${NC}  - Start only the backend server"
    echo -e "  ${BOLD}${GREEN}frontend${NC} - Start only the frontend"
    echo -e "  ${BOLD}${GREEN}stop${NC}     - Stop all running servers"
    echo -e "  ${BOLD}${GREEN}(no args)${NC} - Start both backend and frontend"
    echo
    print_separator
}

# Main script logic
case "$1" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    stop)
        # Find and kill running processes
        print_separator
        echo -e "${BOLD}${YELLOW}Stopping all servers...${NC}"
        pkill -f "uvicorn main:app" 2>/dev/null
        pkill -f "npm run dev" 2>/dev/null
        echo -e "${BOLD}${GREEN}✅ All servers stopped.${NC}"
        print_separator
        ;;
    help|-h|--help)
        show_usage
        ;;
    "")
        # No arguments, start both
        start_both
        ;;
    *)
        echo -e "${RED}Invalid argument: $1${NC}"
        show_usage
        exit 1
        ;;
esac 