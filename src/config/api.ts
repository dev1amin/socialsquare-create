/**
 * Configuração centralizada das URLs da API.
 *
 * Em desenvolvimento usa o proxy Vite (/api) para evitar CORS.
 * Em produção usa VITE_API_BASE_URL ou o fallback do backend.
 */

const isDevelopment = import.meta.env.DEV;
export const API_BASE_URL = isDevelopment
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'https://carousel-api-sepia.vercel.app');

export const ONBOARDING_ENDPOINTS = {
  instagramProfile: `${API_BASE_URL}/api/onboarding/instagram-profile`,
  influencerProfile: `${API_BASE_URL}/api/onboarding/influencer-profile`,
  niches: `${API_BASE_URL}/api/onboarding/niches`,
  analyzeWebsite: `${API_BASE_URL}/api/onboarding/analyze-website`,
  findTargets: `${API_BASE_URL}/api/onboarding/find-targets`,
} as const;
