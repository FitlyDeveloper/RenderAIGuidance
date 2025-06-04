Write-Host "🚀 Deploying DeepSeek Food Analyzer API" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Add remote if not exists
try {
    git remote get-url origin | Out-Null
} catch {
    Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/FitlyDeveloper/RenderAIGuidance.git
}

# Create and switch to DeepSeek branch
Write-Host "🌿 Creating/switching to DeepSeek branch..." -ForegroundColor Yellow
git checkout -b DeepSeek 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout DeepSeek
}

# Add all files
Write-Host "📁 Adding files..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Add DeepSeek Food Analyzer API

Features:
- Complete nutrition analysis using DeepSeek AI
- 34 micronutrients tracking (vitamins, minerals, other)
- Calorie override support for custom inputs
- 100% reliable fallback mode
- Render.com deployment ready

Technical:
- Express.js server with CORS support
- DeepSeek API integration with timeout handling
- Comprehensive error handling and fallbacks
- Accurate serving size calculations
- Food type detection for micronutrient profiles

Deployment:
- Build: npm install
- Start: npm start
- Env: DEEPSEEK_API_KEY required

Purpose: Powers Add Ingredient feature in Flutter fitness app"

# Push to GitHub
Write-Host "⬆️ Pushing to GitHub (DeepSeek branch)..." -ForegroundColor Yellow
git push -u origin DeepSeek

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Repository: https://github.com/FitlyDeveloper/RenderAIGuidance" -ForegroundColor Cyan
Write-Host "🌿 Branch: DeepSeek" -ForegroundColor Cyan
Write-Host "🚀 Ready for Render.com deployment" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Render.com Settings:" -ForegroundColor Magenta
Write-Host "   Build Command: npm install" -ForegroundColor White
Write-Host "   Start Command: npm start" -ForegroundColor White
Write-Host "   Environment: DEEPSEEK_API_KEY = your_key_here" -ForegroundColor White
Write-Host ""
Write-Host "📡 API Endpoint: https://deepseek-uhrc.onrender.com/api/analyze-food" -ForegroundColor Cyan 