#!/bin/bash

# Activate virtual environment
source server/venv/bin/activate

# Run FastAPI backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
