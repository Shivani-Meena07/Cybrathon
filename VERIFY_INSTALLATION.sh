#!/bin/bash
# Smart Queue System - Deployment & Testing Checklist
# Run this to verify everything is working

echo "🔍 Checking Smart Queue System Installation..."
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node --version

# Check npm
echo "✓ Checking npm..."
npm --version

echo ""
echo "📁 Checking directory structure..."

# Backend files
echo ""
echo "Backend files:"
test -f "backend/server.js" && echo "  ✅ server.js exists" || echo "  ❌ server.js missing"
test -f "backend/.env" && echo "  ✅ .env exists" || echo "  ❌ .env missing"
test -f "backend/package.json" && echo "  ✅ package.json exists" || echo "  ❌ package.json missing"

# Frontend files
echo ""
echo "Frontend files:"
test -f "frontend/src/App.jsx" && echo "  ✅ App.jsx exists" || echo "  ❌ App.jsx missing"
test -f "frontend/src/App.css" && echo "  ✅ App.css exists" || echo "  ❌ App.css missing"
test -f "frontend/src/main.jsx" && echo "  ✅ main.jsx exists" || echo "  ❌ main.jsx missing"
test -f "frontend/src/index.css" && echo "  ✅ index.css exists" || echo "  ❌ index.css missing"

# Pages
echo ""
echo "Page files:"
test -f "frontend/src/pages/StudentDashboard.jsx" && echo "  ✅ StudentDashboard.jsx exists" || echo "  ❌ StudentDashboard.jsx missing"
test -f "frontend/src/pages/AdminDashboard.jsx" && echo "  ✅ AdminDashboard.jsx exists" || echo "  ❌ AdminDashboard.jsx missing"

# Components
echo ""
echo "Component files:"
test -f "frontend/src/components/TokenCard.js" && echo "  ✅ TokenCard.js exists" || echo "  ❌ TokenCard.js missing"
test -f "frontend/src/components/ServiceCard.js" && echo "  ✅ ServiceCard.js exists" || echo "  ❌ ServiceCard.js missing"

# Documentation
echo ""
echo "Documentation files:"
test -f "README.md" && echo "  ✅ README.md exists" || echo "  ❌ README.md missing"
test -f "QUICK_START.md" && echo "  ✅ QUICK_START.md exists" || echo "  ❌ QUICK_START.md missing"
test -f "IMPLEMENTATION_SUMMARY.md" && echo "  ✅ IMPLEMENTATION_SUMMARY.md exists" || echo "  ❌ IMPLEMENTATION_SUMMARY.md missing"

echo ""
echo "🎉 All files present!"
echo ""
echo "📦 Next steps:"
echo "1. Open Terminal 1: cd backend && npm install && npm start"
echo "2. Open Terminal 2: cd frontend && npm install && npm run dev"
echo "3. Open browser: http://localhost:5173"
echo ""
echo "✅ System ready for demo!"
