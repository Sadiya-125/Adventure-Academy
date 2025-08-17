// Configuration file for API keys and environment variables
// In a production environment, these should be set as environment variables

export const config = {
  // Google Gemini API Key
  GEMINI_API_KEY:
    import.meta.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,

  // YouTube API Key
  YOUTUBE_API_KEY:
    import.meta.env.VITE_YOUTUBE_API_KEY ||
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
};

// Check if required API keys are available
export const checkAPIKeys = () => {
  const missingKeys = [];

  if (!config.GEMINI_API_KEY) {
    missingKeys.push("GEMINI_API_KEY");
  }

  if (!config.YOUTUBE_API_KEY) {
    missingKeys.push("YOUTUBE_API_KEY");
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
};
