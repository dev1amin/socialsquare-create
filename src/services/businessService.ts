const API_BASE_URL = 'https://carousel-api-sepia.vercel.app';

export interface Influencer {
  handle: string;
  lang: string;
  country: string;
  niche_ids?: string[];
  niche_names?: string[];
}

export interface CreateBusinessPayload {
  name: string;
  website?: string | null;
  social_type: 'Marca pessoal' | 'Empresa';
  instagram: string;
  linkedin?: string | null;
  objective: string;
  influencers: Influencer[];
  niches?: string[] | null;
  custom_niches?: string[] | null;
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

  const accountName = formData.accountName?.trim();
  const instagramHandle = formData.instagramHandle?.trim();
  const socialNetworkType = formData.socialNetworkType;
  const mainObjective = formData.mainObjective?.trim();
  const profilesToMonitor = formData.profilesToMonitor || [];

  console.log('[Business Payload] Extracted fields:', {
    accountName,
    instagramHandle,
    socialNetworkType,
    mainObjective,
    profilesToMonitorCount: profilesToMonitor.length
  });

  if (!accountName || !instagramHandle || !socialNetworkType || !mainObjective) {
    console.error('[Business Payload] Missing required fields:', {
      hasAccountName: !!accountName,
      hasInstagramHandle: !!instagramHandle,
      hasSocialNetworkType: !!socialNetworkType,
      hasMainObjective: !!mainObjective
    });
    return null;
  }

  if (profilesToMonitor.length < 3) {
    console.error('[Business Payload] Need at least 3 profiles to monitor. Current:', profilesToMonitor.length);
    return null;
  }

  const defaultLocale = detectLanguageAndCountry();

  const influencers: Influencer[] = profilesToMonitor.slice(0, 10).map((profile: any) => {
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
    
    return influencer;
  });

  const niches = formData.niches || [];
  console.log('[Business Payload] Niches from form:', niches);

  const predefinedNiches: string[] = [];
  const customNiches: string[] = [];

  niches.forEach((niche: any) => {
    if (typeof niche === 'string') {
      customNiches.push(niche);
    } else if (niche.id) {
      predefinedNiches.push(niche.id);
    } else {
      customNiches.push(niche.text);
    }
  });

  console.log('[Business Payload] Separated niches:', {
    predefinedNiches,
    customNiches
  });

  console.log('[Business Payload] Building influencers list:', influencers);

  const payload: CreateBusinessPayload = {
    name: accountName,
    website: formData.websiteLink?.trim() || null,
    social_type: socialNetworkType === 'Marca Pessoal' ? 'Marca pessoal' : 'Empresa',
    instagram: normalizeHandle(instagramHandle),
    linkedin: formData.linkedinHandle ? normalizeHandle(formData.linkedinHandle) : null,
    objective: mainObjective,
    influencers: influencers,
    niches: predefinedNiches.length > 0 ? predefinedNiches : null,
    custom_niches: customNiches.length > 0 ? customNiches : null
  };

  if (!payload.niches && !payload.custom_niches) {
    console.error('[Business Payload] Need at least one niche or custom niche');
    return null;
  }

  console.log('[Business Payload] Final payload:', JSON.stringify(payload, null, 2));
  return payload;
}
