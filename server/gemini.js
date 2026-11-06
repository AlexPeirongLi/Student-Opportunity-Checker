const {GoogleGenAI} = require("@google/genai");
const MODEL = "gemini-3.6-flash";

async function askGemini(request) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in .env");
  }
  const client = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  try {
    return await client.models.generateContent(request);
  } catch (error) {
    if (error.status === 429) {
      throw new Error("You've used up Gemini's free limit for now. Wait a minute (or until tomorrow) and try again");
    }
    if (error.status === 503) {
      throw new Error("Gemini is busy right now. Try again in a few minutes");
    }
    throw error;
  }
}

function getText(response) {
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("Gemini blocked this request");
  }
  const finishReason = response.candidates[0].finishReason;
  if (finishReason === "MAX_TOKENS") {
    throw new Error("Gemini's answer was too long and got cut off");
  }
  if (finishReason && finishReason !== "STOP") {
    throw new Error(`Gemini stopped early (${finishReason})`);
  }
  return response.text ?? "";
}

module.exports = {MODEL, askGemini, getText};
