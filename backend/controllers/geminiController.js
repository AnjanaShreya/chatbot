const { GoogleGenAI } = require("@google/genai");

class GeminiController {
  static async generateResponse(req, res) {
    try {
      const { message, chatHistory } = req.body;

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return res.status(400).json({
          error: 'Missing Gemini API Key',
          details: 'Please add your GEMINI_API_KEY to the backend/.env file.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
      });

      // Filter out error placeholder messages from history to avoid corrupting LLM context
      const filteredHistory = (chatHistory || []).filter(
        msg =>
          msg.content !==
          "I'm having trouble responding right now. Please try again later."
      );

      // Limit chat history to the last 10 messages for context
      const recentHistory = filteredHistory.slice(-10);

      // Map chat history to the Gemini SDK contents format
      const contents = recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Append the latest user message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting response generation from model: ${modelName}. Context length: ${contents.length} messages.`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              maxOutputTokens: 300,
              temperature: 0.7
            }
          });
          break; // Exit loop on success
        } catch (err) {
          console.warn(`Model ${modelName} failed:`, err.message);
          lastError = err;
        }
      }

      if (!response) {
        throw new Error(`All Gemini models failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
      }

      const text = response.text || "I couldn't generate a response.";

      res.json({ response: text });
    } catch (error) {
      console.error('Gemini SDK Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        details: error.message
      });
    }
  }
}

module.exports = GeminiController;