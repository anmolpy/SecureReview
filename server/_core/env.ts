export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY ?? "",
  huggingFaceApiUrl:
    process.env.HUGGINGFACE_API_URL ??
    "https://router.huggingface.co/v1/chat/completions",
  huggingFaceModel:
    process.env.HUGGINGFACE_MODEL ?? "meta-llama/Llama-3.2-3B-Instruct",
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterApiUrl:
    process.env.OPENROUTER_API_URL ?? "https://openrouter.ai/api/v1",
  openRouterModels: process.env.OPENROUTER_MODELS ?? "",
  openRouterSiteUrl: process.env.OPENROUTER_SITE_URL ?? "",
  openRouterAppName: process.env.OPENROUTER_APP_NAME ?? "SecureReview",
};
