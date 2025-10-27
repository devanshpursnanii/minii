#!/bin/bash

# Pensift Project Startup Script

cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    # Use kill 0 to send signal to all processes in the group
    kill 0
    echo "✅ Servers stopped."
}

trap cleanup EXIT

echo "🧹 Cleaning up old processes..."
# Silently try to kill any processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9 &>/dev/null
lsof -ti:8000 | xargs kill -9 &>/dev/null
echo "✅ Cleanup complete."

echo "🚀 Starting Pensift..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running."

# Start backend
echo "🔧 Starting backend server..."
(
  cd backend
  source venv/bin/activate
  uvicorn main:app --reload --port 8000
) &

# Start frontend
echo "🎨 Starting frontend server..."
(
  cd frontend
  npm run dev
) &

echo "✅ Both servers are starting up in the background..."
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for any background job to exit
wait -n
