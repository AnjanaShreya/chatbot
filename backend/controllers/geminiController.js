const genAI = require('../config/gemini');

class GeminiController {
  static async generateResponse(req, res) {
    try {
      const { message, chatHistory } = req.body;
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro-latest",
      });
      
      const chat = model.startChat({
        history: chatHistory?.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })) || [],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      res.json({ response: text });
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        details: error.message
      });
    }
  }
}

module.exports = GeminiController;