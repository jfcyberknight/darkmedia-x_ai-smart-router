const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_MODEL = 'gemini-1.5-flash';

/** Convertit les messages OpenAI (role/content) en Content[] Gemini (role + parts). */
function toGeminiHistory(messages) {
  const out = [];
  for (const msg of messages) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const text = typeof msg.content === 'string' ? msg.content : msg.content?.[0]?.text ?? '';
    if (!text.trim()) continue;
    out.push({ role, parts: [{ text }] });
  }
  return out;
}

/**
 * Provider Gemini – génère du texte à partir de messages (format OpenAI).
 */
async function generate({ apiKey, model = DEFAULT_MODEL, messages }) {
  if (!apiKey) throw new Error('GEMINI_API_KEY manquant');
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const history = toGeminiHistory(messages);
  const lastUserIndex = history.map((h, i) => (h.role === 'user' ? i : -1)).filter((i) => i >= 0).pop();
  if (lastUserIndex == null) throw new Error('Aucun message utilisateur');

  const lastUserText = history[lastUserIndex].parts[0].text;
  const prevHistory = history.slice(0, lastUserIndex);

  let result;
  if (prevHistory.length > 0) {
    const chat = geminiModel.startChat({ history: prevHistory });
    result = await chat.sendMessage(lastUserText);
  } else {
    result = await geminiModel.generateContent(lastUserText);
  }
  const response = result.response;
  const text = response?.text?.() ?? '';
  return { text, provider: 'gemini', model };
}

module.exports = { generate, DEFAULT_MODEL };
