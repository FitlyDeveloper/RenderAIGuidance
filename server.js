const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: "DeepSeek Food Analyzer API Server",
    status: "operational",
    version: "1.0.0",
    endpoints: {
      health: "GET /",
      analyze: "POST /api/analyze-food",
      nutrition: "POST /api/nutrition"
    }
  });
});

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Validate API key on startup
if (!DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY environment variable is required');
  process.exit(1);
}

// Main nutrition analysis endpoint
app.post('/api/analyze-food', async (req, res) => {
  try {
    console.log('🔍 Received analyze-food request:', req.body);
    
    const { food_name, serving_size, calories_override } = req.body;
    
    if (!food_name || !serving_size) {
      return res.status(400).json({
        success: false,
        error: 'food_name and serving_size are required'
      });
    }

    // Prepare DeepSeek API request
    const systemPrompt = `You are a nutrition expert API. Analyze the given food and return ONLY valid JSON with complete nutritional data.

REQUIRED FORMAT:
{
  "food_name": "exact food name",
  "calories": number,
  "protein": number,
  "fat": number,
  "carbs": number,
  "micronutrients": {
    "vitamin_a": number_in_mcg,
    "vitamin_c": number_in_mg,
    "vitamin_d": number_in_mcg,
    "vitamin_e": number_in_mg,
    "vitamin_k": number_in_mcg,
    "vitamin_b1": number_in_mg,
    "vitamin_b2": number_in_mg,
    "vitamin_b3": number_in_mg,
    "vitamin_b5": number_in_mg,
    "vitamin_b6": number_in_mg,
    "vitamin_b7": number_in_mcg,
    "vitamin_b9": number_in_mcg,
    "vitamin_b12": number_in_mcg,
    "calcium": number_in_mg,
    "chloride": number_in_mg,
    "chromium": number_in_mcg,
    "copper": number_in_mg,
    "fluoride": number_in_mg,
    "iodine": number_in_mcg,
    "iron": number_in_mg,
    "magnesium": number_in_mg,
    "manganese": number_in_mg,
    "molybdenum": number_in_mcg,
    "phosphorus": number_in_mg,
    "potassium": number_in_mg,
    "selenium": number_in_mcg,
    "sodium": number_in_mg,
    "zinc": number_in_mg,
    "fiber": number_in_g,
    "cholesterol": number_in_mg,
    "sugar": number_in_g,
    "saturated_fats": number_in_g,
    "omega_3": number_in_g,
    "omega_6": number_in_g
  }
}

IMPORTANT: 
- Use precise nutritional values based on USDA database standards
- All micronutrient values must be realistic and accurate
- Return ONLY the JSON object, no explanations
- If calories_override is provided, adjust all nutrients proportionally`;

    const userPrompt = calories_override 
      ? `Analyze "${food_name}" in serving size "${serving_size}" with calories adjusted to ${calories_override}. Provide complete nutritional breakdown.`
      : `Analyze "${food_name}" in serving size "${serving_size}". Provide complete nutritional breakdown including all vitamins, minerals, and other nutrients.`;

    const deepSeekRequest = {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    };

    console.log('📡 Calling DeepSeek API...');
    
    const response = await axios.post(DEEPSEEK_API_URL, deepSeekRequest, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const aiResponse = response.data.choices[0].message.content.trim();
    console.log('🤖 DeepSeek raw response:', aiResponse);

    // Parse the JSON response
    let nutritionData;
    try {
      // Clean the response (remove any markdown formatting)
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      nutritionData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate required fields
    const requiredFields = ['food_name', 'calories', 'protein', 'fat', 'carbs', 'micronutrients'];
    for (const field of requiredFields) {
      if (!nutritionData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    console.log('✅ Successfully analyzed food:', nutritionData.food_name);
    
    res.json({
      success: true,
      data: nutritionData
    });

  } catch (error) {
    console.error('❌ Error in analyze-food:', error);
    
    // Fallback response for errors
    const fallbackData = {
      food_name: req.body.food_name || "Unknown Food",
      calories: req.body.calories_override || 100,
      protein: 5,
      fat: 3,
      carbs: 15,
      micronutrients: {
        vitamin_a: 50, vitamin_c: 10, vitamin_d: 2, vitamin_e: 1, vitamin_k: 20,
        vitamin_b1: 0.1, vitamin_b2: 0.1, vitamin_b3: 2, vitamin_b5: 0.5, vitamin_b6: 0.1,
        vitamin_b7: 5, vitamin_b9: 20, vitamin_b12: 0.5,
        calcium: 50, chloride: 100, chromium: 5, copper: 0.1, fluoride: 0.5,
        iodine: 10, iron: 2, magnesium: 25, manganese: 0.2, molybdenum: 5,
        phosphorus: 50, potassium: 150, selenium: 10, sodium: 200, zinc: 1,
        fiber: 2, cholesterol: 5, sugar: 8, saturated_fats: 1, omega_3: 0.1, omega_6: 0.3
      }
    };

    res.json({
      success: true,
      data: fallbackData,
      fallback: true
    });
  }
});

// Alternative endpoint for compatibility
app.post('/api/nutrition', async (req, res) => {
  // Redirect to analyze-food endpoint
  req.url = '/api/analyze-food';
  return app._router.handle(req, res);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DeepSeek Food Analyzer API running on port ${PORT}`);
  console.log(`🔑 DeepSeek API Key: ${DEEPSEEK_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`📡 API Endpoint: http://localhost:${PORT}/api/analyze-food`);
});

module.exports = app; 