import { API_BASE_URL } from '../config/api';

export interface VerifyTokenResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
  };
  code?: string;
}

export interface CompleteRegistrationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    email_confirmed: boolean;
    selected_business_id: string | null;
    needs_business_setup: boolean;
  };
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  code?: string;
  errors?: string[];
}

export interface ResendActivationResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    activation_token: string;
    token_expires_at: string;
  };
}

export async function verifyActivationToken(token: string): Promise<VerifyTokenResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-activation-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Token verification failed',
        code: data.code,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function completeRegistration(
  token: string,
  name: string,
  password: string,
  email?: string
): Promise<CompleteRegistrationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        name,
        password,
        ...(email && { email }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed',
        code: data.code,
        errors: data.errors,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export async function resendActivationEmail(email: string): Promise<ResendActivationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-activation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to resend activation email',
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export interface JWTValidationResponse {
  success: boolean;
  message: string;
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface VerifyJWTResponse {
  success: boolean;
  user_id?: string;
  error?: string;
  message?: string;
}

export async function verifyJWT(jwt: string): Promise<VerifyJWTResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success && data.user_id) {
      return {
        success: true,
        user_id: data.user_id
      };
    }

    return {
      success: false,
      error: data.error || 'JWT verification failed',
      message: data.error || 'JWT verification failed'
    };
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return {
      success: false,
      error: 'Network error during JWT verification',
      message: 'Network error during JWT verification'
    };
  }
}

export function getStoredAuthTokens(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return { accessToken, refreshToken };
  } catch (error) {
    return { accessToken: null, refreshToken: null };
  }
}

export function getStoredUserData(): any | null {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(): boolean {
  try {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt);
  } catch (error) {
    return true;
  }
}

export function checkAuthenticationStatus(): JWTValidationResponse {
  const { accessToken } = getStoredAuthTokens();
  const userData = getStoredUserData();

  if (!accessToken || !userData) {
    return {
      success: false,
      message: 'No authentication found',
      isAuthenticated: false
    };
  }

  if (isTokenExpired()) {
    return {
      success: false,
      message: 'Token expired',
      isAuthenticated: false
    };
  }

  return {
    success: true,
    message: 'User is authenticated',
    isAuthenticated: true,
    user: userData
  };
}

export function storeAuthData(
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  userData: any
): void {
  try {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_expires_at', expiresAt.toString());
    localStorage.setItem('user_data', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to store auth data:', error);
  }
}

// ===== FINALIZE ONBOARDING =====

export interface FinalizeOnboardingResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    email_confirmed: boolean;
    selected_business_id: string | null;
    needs_business_setup: boolean;
  };
  business?: unknown;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  code?: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Finaliza o onboarding: cria usuário Auth + business em um único passo.
 * Substitui a combinação de completeRegistration + createBusiness.
 */
export async function finalizeOnboarding(
  draftToken: string,
  name: string,
  password: string,
  businessPayload: unknown | null,
): Promise<FinalizeOnboardingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/finalize-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draft_token: draftToken,
        name,
        password,
        business: businessPayload,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Falha ao finalizar onboarding',
        code: data.code,
        details: data.details,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Erro de rede. Verifique sua conexão.',
    };
  }
}
