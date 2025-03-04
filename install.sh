#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}=== Gemini Chat App Installation ===${NC}"
echo -e "${YELLOW}This script will install all dependencies for the Gemini Chat App.${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    echo -e "Visit: https://nodejs.org/en/download/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR_VERSION -lt 18 ]; then
    echo -e "${RED}Node.js version $NODE_VERSION detected. Version 18 or higher is required.${NC}"
    echo -e "Please upgrade Node.js and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    echo -e "Visit: https://www.python.org/downloads/"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
PYTHON_MAJOR_VERSION=$(echo $PYTHON_VERSION | cut -d '.' -f 1)
PYTHON_MINOR_VERSION=$(echo $PYTHON_VERSION | cut -d '.' -f 2)
if [ $PYTHON_MAJOR_VERSION -lt 3 ] || ([ $PYTHON_MAJOR_VERSION -eq 3 ] && [ $PYTHON_MINOR_VERSION -lt 8 ]); then
    echo -e "${RED}Python version $PYTHON_VERSION detected. Version 3.8 or higher is required.${NC}"
    echo -e "Please upgrade Python and try again."
    exit 1
fi

# Check if package.json exists
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    echo -e "${RED}package.json not found in $SCRIPT_DIR.${NC}"
    echo -e "${RED}Make sure you're running this script from the root of the repository.${NC}"
    exit 1
fi

echo -e "${GREEN}Installing frontend dependencies...${NC}"
cd "$SCRIPT_DIR" || { echo -e "${RED}Failed to change to script directory.${NC}"; exit 1; }
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install frontend dependencies.${NC}"
    echo -e "${RED}Try running 'npm install' manually to see detailed errors.${NC}"
    exit 1
fi
echo -e "${GREEN}Frontend dependencies installed successfully!${NC}"

echo -e "${GREEN}Setting up backend...${NC}"
cd "$SCRIPT_DIR/backend" || { echo -e "${RED}Backend directory not found.${NC}"; exit 1; }

# Create and activate virtual environment
echo -e "${YELLOW}Creating Python virtual environment...${NC}"
python3 -m venv .venv
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create virtual environment.${NC}"
    echo -e "${RED}Try running 'python3 -m venv .venv' manually to see detailed errors.${NC}"
    exit 1
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to activate virtual environment.${NC}"
    exit 1
fi

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}requirements.txt not found in backend directory.${NC}"
    echo -e "${RED}Make sure the repository is properly cloned.${NC}"
    exit 1
fi

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Python dependencies.${NC}"
    echo -e "${RED}Try running 'pip install -r requirements.txt' manually to see detailed errors.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    echo -e "${YELLOW}Please enter your Gemini API key (get one at https://ai.google.dev/gemini-api/docs/api-key):${NC}"
    read -r API_KEY
    echo "GEMINI_API_KEY=$API_KEY" > .env
    echo -e "${GREEN}.env file created successfully!${NC}"
else
    echo -e "${YELLOW}.env file already exists. Skipping creation.${NC}"
fi

# Return to root directory
cd "$SCRIPT_DIR" || { echo -e "${RED}Failed to return to script directory.${NC}"; exit 1; }

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"
echo -e "${GREEN}Created logs directory for backend server output.${NC}"

echo
echo -e "${GREEN}=== Installation Complete! ===${NC}"
echo -e "${YELLOW}To start the application:${NC}"
echo -e "1. Start the backend server: ${GREEN}./run.sh backend${NC}"
echo -e "2. Start the frontend: ${GREEN}./run.sh frontend${NC}"
echo -e "3. Or start both: ${GREEN}./run.sh${NC}"
echo -e "4. Stop all servers: ${GREEN}./run.sh stop${NC}"
echo
echo -e "${YELLOW}Enjoy chatting with Gemini!${NC}" 