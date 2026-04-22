/**
 * Configuração centralizada das URLs da API.
 *
 * Todos os endpoints de onboarding (perfil do Instagram, lista de nichos,
 * análise de website e busca de influencers) agora apontam para o backend
 * próprio em vez do antigo fluxo n8n (api.workez.online).
 */

export const API_BASE_URL = 'https://carousel-api-sepia.vercel.app';

export const ONBOARDING_ENDPOINTS = {
  instagramProfile: `${API_BASE_URL}/api/onboarding/instagram-profile`,
  influencerProfile: `${API_BASE_URL}/api/onboarding/influencer-profile`,
  niches: `${API_BASE_URL}/api/onboarding/niches`,
  analyzeWebsite: `${API_BASE_URL}/api/onboarding/analyze-website`,
  findTargets: `${API_BASE_URL}/api/onboarding/find-targets`,
} as const;
