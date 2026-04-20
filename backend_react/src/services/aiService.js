const FALLBACK_CATEGORIES = ['Transporte', 'Software', 'Consultoría'];

const fallbackLeads = (location = 'México') => {
  const base = location || 'México';
  return FALLBACK_CATEGORIES.map((category, i) => ({
    name: `${category} ${base} ${i + 1}`,
    address: `${base} - Zona ${i + 1}`,
    phone: `+52 555 000 000${i + 1}`,
    website: `https://example-${category.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}.com`,
    category
  }));
};

const parseGeminiResponse = (rawText) => {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('Gemini response is not an array');
  return parsed;
};

export const generateLeads = async (location = 'México') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackLeads(location);

  const prompt = `Generate 3 fictional but realistic business leads located in ${location}. Return ONLY a JSON array with fields: name,address,phone,website,category.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 }
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      return fallbackLeads(location);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return fallbackLeads(location);

    return parseGeminiResponse(text);
  } catch {
    return fallbackLeads(location);
  } finally {
    clearTimeout(timeoutId);
  }
};
