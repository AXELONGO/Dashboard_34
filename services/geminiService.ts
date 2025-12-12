import { Lead } from "../types";

const API_BASE_URL = "/api";

export const generateLeadsByLocation = async (location: string): Promise<Omit<Lead, 'id' | 'isSelected'>[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/generate-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend AI Error:", errorText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating leads via backend:", error);
    return [];
  }
};

