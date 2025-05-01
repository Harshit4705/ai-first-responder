import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeImage, generateFirstAidInstructions } from "./ai-service";
import { getNearbyHospitals } from "./maps-service";
import { translateText } from "./translation-service";
import { analysisInputSchema, chatInputSchema, locationInputSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Image analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      // Validate the request body
      const { image } = analysisInputSchema.parse(req.body);
      
      // Analyze the image
      const analysisResult = await analyzeImage(image);
      
      // Generate first aid instructions based on the detected injury
      const instructions = await generateFirstAidInstructions(
        analysisResult.injuryType, 
        analysisResult.severity
      );
      
      // Get sample nearby hospitals (in a real app, this would use the user's location)
      const defaultLocation = { latitude: 28.6139, longitude: 77.2090 }; // Default to New Delhi, India
      const nearbyFacilities = await getNearbyHospitals(defaultLocation);
      
      // Store the analysis result in the database
      const savedAnalysis = await storage.createAnalysis({
        injuryType: analysisResult.injuryType,
        severity: analysisResult.severity,
        confidence: analysisResult.confidence,
        firstAidInstructions: instructions,
        recommendedAction: analysisResult.recommendedAction,
        imageUrl: null // In a real app, you'd store the image securely or a reference to it
      });
      
      // Return the complete result
      return res.status(200).json({
        id: savedAnalysis.id,
        injuryType: analysisResult.injuryType,
        severity: analysisResult.severity,
        confidence: analysisResult.confidence,
        firstAidInstructions: instructions,
        recommendedAction: analysisResult.recommendedAction,
        nearbyFacilities
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      
      return res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  // Chatbot endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId } = chatInputSchema.parse(req.body);
      
      // Store the user message
      await storage.saveChatMessage({
        message,
        isUserMessage: true,
        userId: userId || null
      });
      
      // Generate AI response - we know this is in chat mode so it returns ChatResponse
      const response = await generateFirstAidInstructions(message, null, true);
      
      // We need to check if the response is a ChatResponse (has text property)
      if ('text' in response) {
        // Store the AI response
        await storage.saveChatMessage({
          message: response.text,
          isUserMessage: false,
          userId: userId || null
        });
        
        return res.status(200).json({ response: response.text });
      } else {
        // This should never happen in chat mode, but let's handle it
        return res.status(500).json({ error: "Invalid response format from AI" });
      }
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      
      return res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get nearby hospitals endpoint
  app.post("/api/nearby-hospitals", async (req, res) => {
    try {
      const { latitude, longitude } = locationInputSchema.parse(req.body);
      
      const nearbyFacilities = await getNearbyHospitals({ latitude, longitude });
      
      return res.status(200).json({ facilities: nearbyFacilities });
    } catch (error) {
      console.error("Error finding nearby hospitals:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid location data", details: error.errors });
      }
      
      return res.status(500).json({ error: "Failed to find nearby hospitals" });
    }
  });

  // Translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const translatedText = await translateText(text, targetLanguage);
      
      return res.status(200).json({ translatedText });
    } catch (error) {
      console.error("Error translating text:", error);
      return res.status(500).json({ error: "Failed to translate text" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
