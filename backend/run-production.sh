#!/bin/bash

# ========================================
# Run Backend with Production Database
# ========================================
# This script runs the backend locally but
# connected to the production Railway database.
#
# ⚠️  WARNING: You are working with PRODUCTION data!
# ========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}║   ⚠️   PRODUCTION DATABASE MODE   ⚠️                        ║${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}║   You are connecting to the REAL production database.     ║${NC}"
echo -e "${RED}║   Any changes will affect live users!                     ║${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo "Please create .env.production with production database credentials."
    exit 1
fi

# Confirm before proceeding
echo -e "${YELLOW}Are you sure you want to continue? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo -e "${GREEN}Starting backend with production database...${NC}"
echo -e "${GREEN}Backend will be available at: http://localhost:5000${NC}"
echo ""

# Copy production env to .env temporarily and run
cp .env .env.backup 2>/dev/null || true
cp .env.production .env

# Trap to restore original .env on exit
cleanup() {
    if [ -f ".env.backup" ]; then
        mv .env.backup .env
        echo ""
        echo -e "${GREEN}Restored original .env file${NC}"
    fi
}
trap cleanup EXIT

# Run the development server
npm run dev
