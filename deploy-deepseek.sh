#!/bin/bash

echo "🚀 Deploying DeepSeek Food Analyzer API"
echo "======================================="

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add remote if not exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/FitlyDeveloper/RenderAIGuidance.git
fi

# Create and switch to DeepSeek branch
echo "🌿 Creating/switching to DeepSeek branch..."
git checkout -b DeepSeek 2>/dev/null || git checkout DeepSeek

# Add all files
echo "📁 Adding files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "🚀 Add DeepSeek Food Analyzer API

✨ Features:
- Complete nutrition analysis using DeepSeek AI
- 34 micronutrients tracking (vitamins, minerals, other)
- Calorie override support for custom inputs
- 100% reliable fallback mode
- Render.com deployment ready

🔧 Technical:
- Express.js server with CORS support
- DeepSeek API integration with timeout handling
- Comprehensive error handling and fallbacks
- Accurate serving size calculations
- Food type detection for micronutrient profiles

📦 Deployment:
- Build: npm install
- Start: npm start
- Env: DEEPSEEK_API_KEY required

🎯 Purpose: Powers 'Add Ingredient' feature in Flutter fitness app"

# Push to GitHub
echo "⬆️ Pushing to GitHub (DeepSeek branch)..."
git push -u origin DeepSeek

echo ""
echo "✅ Deployment complete!"
echo "🌐 Repository: https://github.com/FitlyDeveloper/RenderAIGuidance"
echo "🌿 Branch: DeepSeek"
echo "🚀 Ready for Render.com deployment"
echo ""
echo "🔧 Render.com Settings:"
echo "   Build Command: npm install"
echo "   Start Command: npm start"
echo "   Environment: DEEPSEEK_API_KEY = your_key_here"
echo ""
echo "📡 API Endpoint: https://deepseek-uhrc.onrender.com/api/analyze-food" 