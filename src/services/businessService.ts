import { API_BASE_URL } from '../config/api';

export interface Influencer {
  handle: string;
  lang: string;
  country: string;
  niche_ids?: string[];
  niche_names?: string[];
  display_name?: string;
  snapshot?: {
    display_name?: string | null;
    bio?: string | null;
    profile_pic_s3?: string | null;
    followers_count?: number | null;
    following_count?: number | null;
    media_count?: number | null;
    is_verified?: boolean;
    fetched_at?: string;
  };
}

export interface CreateBusinessPayload {
  name: string;
  website?: string | null;
  social_type: 'Marca pessoal' | 'Empresa';
  instagram: string;
  linkedin?: string | null;
  objective: string;
  influencers: Influencer[] | null;
  niches?: string[] | null;
  custom_niches?: string[] | null;
  post_count?: number;
}

export interface CreateBusinessResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    user_id: string;
    name: string;
    website?: string | null;
    instagram_username: string;
    linkedin_username?: string | null;
    social_type: string;
    objective: string;
    created_at: string;
    influencers_created?: Array<{
      influencer_id: string;
      handle: string;
    }>;
  };
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, '').trim();
}

function detectLanguageAndCountry(): { lang: string; country: string } {
  try {
    const browserLang = navigator.language || 'pt-BR';
    const [lang, country] = browserLang.toLowerCase().split('-');
    return {
      lang: lang || 'pt',
      country: country || 'br'
    };
  } catch (error) {
    return { lang: 'pt', country: 'br' };
  }
}

export async function createBusiness(
  accessToken: string,
  payload: CreateBusinessPayload
): Promise<CreateBusinessResponse> {
  try {
    console.log('[Create Business] Starting business creation');
    console.log('[Create Business] Payload:', JSON.stringify(payload, null, 2));
    console.log('[Create Business] Access token present:', !!accessToken);

    const response = await fetch(`${API_BASE_URL}/api/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    console.log('[Create Business] Response status:', response.status);

    const data = await response.json();
    console.log('[Create Business] Response data:', data);

    if (!response.ok) {
      console.error('[Create Business] Failed:', data);
      return {
        success: false,
        message: data.message || data.error || 'Failed to create business',
        error: data.error,
        details: data.details
      };
    }

    console.log('[Create Business] Success!');
    return {
      success: true,
      message: data.message || 'Business created successfully',
      data: data.data
    };
  } catch (error) {
    console.error('[Create Business] Network error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function transformFormDataToBusinessPayload(formData: any): CreateBusinessPayload | null {
  console.log('[Business Payload] Starting transformation');
  console.log('[Business Payload] Form data received:', JSON.stringify(formData, null, 2));

  // Use the name from getUserProfile response instead of accountName
  const profileName = formData.userProfileMetrics?.name?.trim();
  const accountName = formData.accountName?.trim();
  const businessName = profileName || accountName;
  
  const instagramHandle = formData.instagramHandle?.trim();
  const socialNetworkType = formData.socialNetworkType;
  const mainObjective = formData.mainObjective?.trim();
  const profilesToMonitor = formData.profilesToMonitor || [];

  console.log('[Business Payload] Extracted fields:', {
    profileName,
    accountName,
    businessName,
    instagramHandle,
    socialNetworkType,
    mainObjective,
    profilesToMonitorCount: profilesToMonitor.length
  });

  const missing: string[] = [];
  if (!businessName) missing.push('nome do negócio');
  if (!instagramHandle) missing.push('@ do Instagram');
  if (!socialNetworkType) missing.push('tipo (Marca pessoal/Empresa)');
  if (!mainObjective) missing.push('objetivo principal');

  if (missing.length > 0) {
    const msg = `Faltando: ${missing.join(', ')}`;
    console.error('[Business Payload] Missing required fields:', missing);
    throw new Error(msg);
  }

  const defaultLocale = detectLanguageAndCountry();

  let influencers: Influencer[] | null = null;

  if (profilesToMonitor && profilesToMonitor.length > 0) {
    influencers = profilesToMonitor.slice(0, 10).map((profile: any) => {
    const handle = typeof profile === 'string' ? profile : profile.text;
    const influencer: Influencer = {
      handle: normalizeHandle(handle),
      lang: typeof profile === 'object' && profile.lang ? profile.lang : defaultLocale.lang,
      country: typeof profile === 'object' && profile.country ? profile.country : defaultLocale.country
    };
    
    // Add UUID-based niches to niche_ids
    if (typeof profile === 'object' && profile.niche_ids && profile.niche_ids.length > 0) {
      // Filter only UUIDs (not custom- prefixed ones for backward compatibility)
      const uuidNiches = profile.niche_ids.filter((id: string) => !id.startsWith('custom-'));
      if (uuidNiches.length > 0) {
        influencer.niche_ids = uuidNiches;
      }
    }
    
    // Add custom niches to niche_names
    if (typeof profile === 'object' && profile.niche_names && profile.niche_names.length > 0) {
      influencer.niche_names = profile.niche_names;
    }

    // Incluir snapshot de perfil para persistência no banco
    if (typeof profile === 'object' && profile.snapshot) {
      influencer.snapshot = profile.snapshot;
    }
    
    return influencer;
    });
  }

  const niches = formData.niches || [];
  console.log('[Business Payload] Niches from form:', niches);

  const predefinedNiches: string[] = [];
  const customNiches: string[] = [];

  // UUID v4 regex — ids predefinidos sao UUIDs reais; ids "custom-xxx" sao gerados client-side e devem ir como custom
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  niches.forEach((niche: any) => {
    if (typeof niche === 'string') {
      customNiches.push(niche);
    } else if (niche.id && UUID_RE.test(niche.id)) {
      predefinedNiches.push(niche.id);
    } else if (niche.text) {
      customNiches.push(niche.text);
    }
  });

  // Tambem aceita formData.custom_niches: string[] (caso a UI envie separado)
  if (Array.isArray(formData.custom_niches)) {
    for (const c of formData.custom_niches) {
      if (typeof c === 'string' && c.trim()) customNiches.push(c.trim());
    }
  }

  console.log('[Business Payload] Separated niches:', {
    predefinedNiches,
    customNiches
  });

  console.log('[Business Payload] Building influencers list:', influencers);

  // Get post count from getUserProfile response
  const mediaValue = formData.userProfileMetrics?.media;
  console.log('[Business Payload] Media value:', mediaValue, 'Type:', typeof mediaValue);
  const postCount = mediaValue ? parseInt(mediaValue, 10) : undefined;
  console.log('[Business Payload] Post count after parsing:', postCount);

  const payload: CreateBusinessPayload = {
    name: businessName,
    website: formData.websiteLink?.trim() || null,
    social_type: socialNetworkType === 'Marca Pessoal' ? 'Marca pessoal' : 'Empresa',
    instagram: normalizeHandle(instagramHandle),
    linkedin: null,
    objective: mainObjective,
    influencers: influencers,
    niches: predefinedNiches.length > 0 ? predefinedNiches : null,
    custom_niches: customNiches.length > 0 ? customNiches : null,
    post_count: postCount
  };

  if (!payload.niches && !payload.custom_niches) {
    console.error('[Business Payload] Need at least one niche or custom niche');
    throw new Error('Selecione pelo menos um nicho');
  }

  console.log('[Business Payload] Final payload:', JSON.stringify(payload, null, 2));
  return payload;
}
