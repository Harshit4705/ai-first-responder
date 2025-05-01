import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Use Gemini 1.5 Flash for image analysis (updated from gemini-pro-vision which was deprecated)
const visionModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// Use Gemini 1.5 Flash for text-only operations (updated for consistency)
const textModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

interface AnalysisResult {
  injuryType: string;
  severity: number;
  confidence: number;
  recommendedAction: string;
}

interface FirstAidInstruction {
  id: number;
  title: string;
  description: string;
}

interface ChatResponse {
  text: string;
}

/**
 * Parses a JSON string safely, with fallback values
 */
function safeParseJSON(jsonString: string, defaultValue: any = {}) {
  try {
    // Find JSON object in the string, as Gemini might wrap it in markdown
    const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || 
                      jsonString.match(/{[\s\S]*}/);
    
    const jsonContent = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : jsonString;
    return JSON.parse(jsonContent);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return defaultValue;
  }
}

/**
 * Analyzes an image to detect injuries and provide first aid recommendations
 * @param imageBase64 The base64-encoded image data
 * @returns Analysis result with injury type, severity, and recommendations
 */
export async function analyzeImage(imageBase64: string): Promise<AnalysisResult> {
  try {
    // Remove the data URL prefix if present
    const base64Image = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    // Create a parts array for the Gemini API
    const parts = [
      {
        text: `You are a medical image analysis expert specializing in injury detection and first aid. 
Analyze the image and identify any visible injuries or medical conditions. 
Provide a detailed assessment including the type of injury, severity on a scale of 0-10 (where 0 is no injury and 10 is life-threatening), your confidence level (0.0-1.0), and a recommended action. For emergencies in India, use emergency number 112 instead of 911.

Return your analysis in VALID JSON FORMAT with the following structure:
{
  "injuryType": "Cut/laceration/abrasion etc.",
  "severity": 3,
  "confidence": 0.8,
  "recommendedAction": "Clean the wound and apply a bandage"
}

Important: Your entire response must be valid JSON that can be parsed with JSON.parse(). Do not include any additional text, markdown formatting, or explanations outside the JSON object.`
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ];

    // Set up generation configuration with specific generation config
    const generationConfig = {
      temperature: 0.4, // Lower temperature for more factual responses
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    };

    // Generate content with the vision model
    const result = await visionModel.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });

    const response = result.response;
    const responseText = response.text();
    
    console.log("AI response for image analysis:", responseText);
    
    // Parse the response as JSON
    const parsedResult = safeParseJSON(responseText, {
      injuryType: "Unknown injury",
      severity: 5,
      confidence: 0.5,
      recommendedAction: "Seek professional medical advice"
    });
    
    // Validate and normalize the results
    return {
      injuryType: parsedResult.injuryType || "Unknown injury",
      severity: Math.min(Math.max(parseFloat(String(parsedResult.severity)) || 0, 0), 10),
      confidence: Math.min(Math.max(parseFloat(String(parsedResult.confidence)) || 0.5, 0), 1),
      recommendedAction: parsedResult.recommendedAction || "Seek professional medical advice"
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze the image. Please try again.");
  }
}

/**
 * Generates first aid instructions for a specific injury
 * @param injuryType The type of injury detected
 * @param severity The severity of the injury (0-10)
 * @param isChatMode Whether this is being called from the chatbot interface
 * @returns Array of first aid instructions or chat response
 */
export async function generateFirstAidInstructions(
  injuryType: string, 
  severity: number | null,
  isChatMode = false
): Promise<FirstAidInstruction[] | ChatResponse> {
  try {
    // Set up generation configuration with specific generation config
    const generationConfig = {
      temperature: 0.4, // Lower temperature for more factual responses
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    };

    if (isChatMode) {
      const chatPrompt = `You are a first aid assistant providing accurate emergency medical guidance for users in India. Always emphasize when users should seek professional medical care. Never diagnose conditions - only provide first aid advice based on symptoms or injuries described. Your responses should be clear, concise, and focused on immediate actions.

The user has asked about: "${injuryType}". 
Provide a helpful, accurate, and concise first aid response. 
Focus on immediate actions they can take, when to seek professional help, and what NOT to do.
Be empathetic but clear and direct with safety-critical information.
If you mention emergency services, use the emergency number 112 for India.`;
      
      const result = await textModel.generateContent({
        contents: [{ role: "user", parts: [{ text: chatPrompt }] }],
        generationConfig,
      });
      
      return { text: result.response.text() };
    } else {
      // For injury analysis, generate structured first aid steps
      const instructionsPrompt = `You are a first aid expert providing clear, step-by-step instructions for treating injuries. Your advice should be accurate, evidence-based, and appropriate for the injury type and severity.

Generate first aid instructions for ${injuryType} with a severity level of ${severity || 'unknown'} (on a scale of 0-10).
Format the response as JSON with an array of instructions, each containing: 
id (number), title (short instruction title), and description (detailed step).
Include 4-6 steps that are specific to this injury and severity level.

Return ONLY JSON in this format without any additional text, markdown formatting, or explanations:
{
  "instructions": [
    {
      "id": 1,
      "title": "Step title",
      "description": "Detailed description"
    },
    ...
  ]
}

Your response must be valid JSON that can be parsed with JSON.parse().`;
      
      const result = await textModel.generateContent({
        contents: [{ role: "user", parts: [{ text: instructionsPrompt }] }],
        generationConfig: {
          ...generationConfig,
          temperature: 0.3, // Even more precise for structured data
        }
      });
      
      const responseText = result.response.text();
      console.log("AI response for first aid instructions:", responseText);
      
      const parsedResult = safeParseJSON(responseText, { instructions: [] });
      
      // Define a function to check if an object matches FirstAidInstruction interface
      const isValidInstruction = (instr: unknown): instr is FirstAidInstruction => {
        return instr !== null && 
               typeof instr === 'object' && 
               'id' in instr && typeof (instr as FirstAidInstruction).id === 'number' && 
               'title' in instr && typeof (instr as FirstAidInstruction).title === 'string' && 
               'description' in instr && typeof (instr as FirstAidInstruction).description === 'string';
      };
      
      // Make sure we have valid instructions with all required fields
      const validatedInstructions = Array.isArray(parsedResult.instructions) 
        ? parsedResult.instructions.filter(isValidInstruction)
        : [];
        
      if (validatedInstructions.length === 0) {
        // Fallback if no valid instructions
        return [
          {
            id: 1,
            title: "Clean the affected area",
            description: "Gently clean the area with mild soap and lukewarm water."
          },
          {
            id: 2, 
            title: "Seek medical attention",
            description: "For proper diagnosis and treatment, consult with a healthcare professional."
          }
        ];
      }
      
      return validatedInstructions;
    }
  } catch (error) {
    console.error("Error generating first aid instructions:", error);
    if (isChatMode) {
      return { 
        text: "I'm sorry, I couldn't generate a response at this time. Please try asking again or contact emergency services if this is urgent."
      };
    }
    return [
      {
        id: 1,
        title: "Seek medical attention",
        description: "We encountered an error generating specific instructions. Please seek professional medical advice immediately."
      }
    ];
  }
}
