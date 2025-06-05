// Import required packages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const fs = require('fs'); // For logging to file
const { analyzeNutrition } = require('./100_percent_reliable.js');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Debug startup
console.log('Starting server...');
console.log('Node environment:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());
console.log('OpenAI API Key present:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

// Configure logging
const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  fs.appendFileSync('api-server.log', logMessage);
  console.log(message);
};

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT || 30, // Limit each IP to 30 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// Configure CORS
app.use(cors());

// Set trust proxy for proper IP detection behind reverse proxies (fixes express-rate-limit warning)
app.set('trust proxy', 1);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));

// Define routes
app.get('/', (req, res) => {
  res.json({
    message: 'Food Analyzer API Server',
    status: 'operational'
  });
});

// OpenAI proxy endpoint for food analysis
app.post('/api/analyze-food', limiter, async (req, res) => {
  try {
    logToFile('Analyze food endpoint called');
    const { image } = req.body;

    if (!image) {
      logToFile('No image provided in request');
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    // Debug logging
    logToFile(`Received image data, length: ${image.length}`);
    logToFile(`Image data starts with: ${image.substring(0, 50)}`);

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      logToFile('OpenAI API key not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: OpenAI API key not set'
      });
    }

    // Call our corrected nutrition analysis module
    logToFile('Calling nutrition analysis module...');
    
    const nutritionData = await analyzeNutrition(image);
    
    if (!nutritionData) {
      logToFile('Failed to analyze nutrition data');
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze nutrition data'
      });
    }

    logToFile('Successfully analyzed nutrition data');
    
    // 🔬 LOG ALL 34 MICRONUTRIENTS TO TERMINAL
    if (nutritionData) {
      console.log('\n🔬 ===== COMPLETE MICRONUTRIENT ANALYSIS =====');
      console.log(`📊 Meal: ${nutritionData.meal_name || 'Unknown'}`);
      console.log(`🍽️ Total Calories: ${nutritionData.calories || nutritionData.total_calories || 0}`);
      console.log(`🥩 Protein: ${nutritionData.protein || nutritionData.total_protein || 0}g`);
      console.log(`🧈 Fat: ${nutritionData.fat || nutritionData.total_fat || 0}g`);
      console.log(`🍞 Carbs: ${nutritionData.carbs || nutritionData.total_carbs || 0}g`);
      
      console.log('\n💊 VITAMINS (13):');
      console.log(`  Vitamin A: ${nutritionData.vitamin_a || 0} mcg`);
      console.log(`  Vitamin C: ${nutritionData.vitamin_c || 0} mg`);
      console.log(`  Vitamin D: ${nutritionData.vitamin_d || 0} mcg`);
      console.log(`  Vitamin E: ${nutritionData.vitamin_e || 0} mg`);
      console.log(`  Vitamin K: ${nutritionData.vitamin_k || 0} mcg`);
      console.log(`  Vitamin B1 (Thiamine): ${nutritionData.vitamin_b1 || 0} mg`);
      console.log(`  Vitamin B2 (Riboflavin): ${nutritionData.vitamin_b2 || 0} mg`);
      console.log(`  Vitamin B3 (Niacin): ${nutritionData.vitamin_b3 || 0} mg`);
      console.log(`  Vitamin B5 (Pantothenic): ${nutritionData.vitamin_b5 || 0} mg`);
      console.log(`  Vitamin B6 (Pyridoxine): ${nutritionData.vitamin_b6 || 0} mg`);
      console.log(`  Vitamin B7 (Biotin): ${nutritionData.vitamin_b7 || 0} mcg`);
      console.log(`  Vitamin B9 (Folate): ${nutritionData.vitamin_b9 || 0} mcg`);
      console.log(`  Vitamin B12 (Cobalamin): ${nutritionData.vitamin_b12 || 0} mcg`);
      
      console.log('\n⚗️ MINERALS (15):');
      console.log(`  Calcium: ${nutritionData.calcium || 0} mg`);
      console.log(`  Chloride: ${nutritionData.chloride || 0} mg`);
      console.log(`  Chromium: ${nutritionData.chromium || 0} mcg`);
      console.log(`  Copper: ${nutritionData.copper || 0} mcg`);
      console.log(`  Fluoride: ${nutritionData.fluoride || 0} mg`);
      console.log(`  Iodine: ${nutritionData.iodine || 0} mcg`);
      console.log(`  Iron: ${nutritionData.iron || 0} mg`);
      console.log(`  Magnesium: ${nutritionData.magnesium || 0} mg`);
      console.log(`  Manganese: ${nutritionData.manganese || 0} mg`);
      console.log(`  Molybdenum: ${nutritionData.molybdenum || 0} mcg`);
      console.log(`  Phosphorus: ${nutritionData.phosphorus || 0} mg`);
      console.log(`  Potassium: ${nutritionData.potassium || 0} mg`);
      console.log(`  Selenium: ${nutritionData.selenium || 0} mcg`);
      console.log(`  Sodium: ${nutritionData.sodium || 0} mg`);
      console.log(`  Zinc: ${nutritionData.zinc || 0} mg`);
      
      console.log('\n🥗 OTHER NUTRIENTS (6):');
      console.log(`  Fiber: ${nutritionData.fiber || 0} g`);
      console.log(`  Cholesterol: ${nutritionData.cholesterol || 0} mg`);
      console.log(`  Sugar: ${nutritionData.sugar || 0} g`);
      console.log(`  Saturated Fats: ${nutritionData.saturated_fats || 0} g`);
      console.log(`  Omega-3: ${nutritionData.omega_3 || 0} mg`);
      console.log(`  Omega-6: ${nutritionData.omega_6 || 0} mg`);
      
      if (nutritionData.ingredients && nutritionData.ingredients.length > 0) {
        console.log('\n🔬 INGREDIENT BREAKDOWN:');
        nutritionData.ingredients.forEach((ingredient, index) => {
          // Handle both string and object ingredient formats
          let name, amount, calories, protein, fat, carbs;
          
          if (typeof ingredient === 'string') {
            name = ingredient;
            amount = 'N/A';
            calories = protein = fat = carbs = 0;
          } else {
            name = ingredient.name || `Ingredient ${index + 1}`;
            amount = ingredient.amount || ingredient.weight_g ? `${ingredient.weight_g}g` : 'N/A';
            calories = ingredient.calories || 0;
            protein = ingredient.protein || ingredient.protein_g || 0;
            fat = ingredient.fat || ingredient.fat_g || 0;
            carbs = ingredient.carbs || ingredient.carbs_g || 0;
          }
          
          console.log(`  ${index + 1}. ${name} (${amount})`);
          console.log(`     Calories: ${calories}, Protein: ${protein}g, Fat: ${fat}g, Carbs: ${carbs}g`);
        });
      }
      
      console.log('🔬 ============================================\n');
    }
    
    return res.json({
      success: true,
      data: nutritionData
    });
  } catch (error) {
    logToFile(`Server error: ${error.message}`);
    logToFile(error.stack);
    return res.status(500).json({
      success: false,
      error: 'Server error processing request',
      message: error.message
    });
  }
});

// Text-based food analysis endpoint for nutrition calculation
app.post('/api/nutrition', limiter, async (req, res) => {
  try {
    logToFile('Nutrition calculation endpoint called');
    const { food_name, serving_size, operation_type, instructions, current_data } = req.body;

    // Log the request data
    logToFile(`Food name: ${food_name}, Serving size: ${serving_size}`);
    if (operation_type) logToFile(`Operation type: ${operation_type}`);
    if (instructions) logToFile(`Instructions: ${instructions}`);
    
    // Check if we have the minimal required data
    if (!food_name) {
      logToFile('No food name provided in request');
      return res.status(400).json({
        success: false,
        error: 'Food name is required'
      });
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      logToFile('OpenAI API key not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: OpenAI API key not set'
      });
    }

    // Build the prompt based on request type
    let systemPrompt, userPrompt;
    
    if (operation_type === 'GENERAL' || operation_type === 'REDUCE_CALORIES' || 
        operation_type === 'INCREASE_CALORIES' || operation_type === 'REMOVE_INGREDIENT' || 
        operation_type === 'ADD_INGREDIENT') {
      // Food modification prompt
      systemPrompt = 'You are a nutrition expert. Analyze the provided food description and make modifications based on instructions. Return a JSON with the updated nutritional values and ingredients.';
      
      let foodDescription = `Food: ${food_name}\n`;
      
      if (current_data) {
        if (current_data.calories) foodDescription += `Total calories: ${current_data.calories}\n`;
        if (current_data.protein) foodDescription += `Total protein: ${current_data.protein}\n`;
        if (current_data.fat) foodDescription += `Total fat: ${current_data.fat}\n`;
        if (current_data.carbs) foodDescription += `Total carbs: ${current_data.carbs}\n`;
        
        if (current_data.ingredients && current_data.ingredients.length > 0) {
          foodDescription += 'Ingredients:\n';
          for (const ingredient of current_data.ingredients) {
            let ingredientDesc = `- ${ingredient.name}`;
            if (ingredient.amount) ingredientDesc += ` (${ingredient.amount})`;
            if (ingredient.calories) ingredientDesc += `: ${ingredient.calories} calories`;
            if (ingredient.protein) ingredientDesc += `, ${ingredient.protein}g protein`;
            if (ingredient.fat) ingredientDesc += `, ${ingredient.fat}g fat`;
            if (ingredient.carbs) ingredientDesc += `, ${ingredient.carbs}g carbs`;
            foodDescription += ingredientDesc + '\n';
          }
        }
      }
      
      if (instructions) {
        foodDescription += `\nPlease ${operation_type === 'GENERAL' ? 'analyze and update' : operation_type.toLowerCase().replace('_', ' ')} the food according to the following instruction: '${instructions}'`;
      }
      
      userPrompt = foodDescription;
    } else {
      // Basic nutrition calculation prompt
      systemPrompt = 'You are a nutrition expert. Calculate accurate nutritional values for the provided food and serving size. Return a JSON with calories, protein, fat, and carbs.';
      userPrompt = `Calculate accurate nutritional values for ${food_name}, serving size: ${serving_size || '1 serving'}. Return only the JSON with calories, protein, fat, and carbs.`;
    }

    // Prepare request body for OpenAI
    const requestBody = {
      model: 'gpt-4o',
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    };
    
    logToFile('OpenAI request payload prepared');
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      logToFile(`OpenAI API error: ${response.status} ${errorData}`);
      return res.status(response.status).json({
        success: false,
        error: `OpenAI API error: ${response.status}`,
        details: errorData
      });
    }

    logToFile('OpenAI API response received');
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      logToFile(`Invalid response format from OpenAI: ${JSON.stringify(data)}`);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from OpenAI',
        raw_response: data
      });
    }

    const content = data.choices[0].message.content;
    
    try {
      // Parse the content as JSON
      const parsedData = JSON.parse(content);
      logToFile('Successfully parsed JSON response for nutrition data');
      
      return res.json({
        success: true,
        data: parsedData
      });
    } catch (error) {
      logToFile(`JSON parsing failed: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse nutrition data',
        message: error.message
      });
    }
  } catch (error) {
    logToFile(`Server error: ${error.message}`);
    logToFile(error.stack);
    return res.status(500).json({
      success: false,
      error: 'Server error processing nutrition request',
      message: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  logToFile(`Server running on port ${PORT}`);
  logToFile(`API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});

