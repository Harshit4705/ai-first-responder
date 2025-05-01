import { db } from "@db";
import { analyses, chatMessages } from "@shared/schema";
import { sql } from "drizzle-orm";

interface AnalysisData {
  injuryType: string;
  severity: number;
  confidence: number;
  firstAidInstructions: any;
  recommendedAction: string;
  imageUrl: string | null;
  userId?: number;
}

interface ChatMessageData {
  message: string;
  isUserMessage: boolean;
  userId: number | null;
}

export const storage = {
  /**
   * Create a new analysis record
   */
  async createAnalysis(data: AnalysisData) {
    try {
      const [analysis] = await db.insert(analyses).values({
        injuryType: data.injuryType,
        severity: data.severity,
        confidence: data.confidence,
        firstAidInstructions: data.firstAidInstructions,
        recommendedAction: data.recommendedAction,
        imageUrl: data.imageUrl,
        userId: data.userId,
        createdAt: new Date(),
      }).returning();
      
      return analysis;
    } catch (error) {
      console.error("Error creating analysis:", error);
      throw new Error("Failed to save analysis results");
    }
  },

  /**
   * Get analysis by ID
   */
  async getAnalysis(id: number) {
    try {
      return await db.query.analyses.findFirst({
        where: (analyses, { eq }) => eq(analyses.id, id)
      });
    } catch (error) {
      console.error("Error fetching analysis:", error);
      return null;
    }
  },

  /**
   * Get analyses for a user
   */
  async getUserAnalyses(userId: number) {
    try {
      return await db.query.analyses.findMany({
        where: (analyses, { eq }) => eq(analyses.userId, userId),
        orderBy: (analyses, { desc }) => [desc(analyses.createdAt)]
      });
    } catch (error) {
      console.error("Error fetching user analyses:", error);
      return [];
    }
  },

  /**
   * Save a chat message
   */
  async saveChatMessage(data: ChatMessageData) {
    try {
      const [message] = await db.insert(chatMessages).values({
        message: data.message,
        isUserMessage: data.isUserMessage,
        userId: data.userId,
        createdAt: new Date(),
      }).returning();
      
      return message;
    } catch (error) {
      console.error("Error saving chat message:", error);
      throw new Error("Failed to save chat message");
    }
  },

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: number | null, limit = 50) {
    try {
      if (userId) {
        return await db.query.chatMessages.findMany({
          where: (chatMessages, { eq }) => eq(chatMessages.userId, userId),
          orderBy: (chatMessages, { asc }) => [asc(chatMessages.createdAt)],
          limit
        });
      } else {
        // For anonymous users, get most recent messages from the system
        return await db.query.chatMessages.findMany({
          where: (chatMessages, { isNull }) => isNull(chatMessages.userId),
          orderBy: (chatMessages, { asc }) => [asc(chatMessages.createdAt)],
          limit
        });
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  }
};
