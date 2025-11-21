import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormData } from '../types/form';
import { onboardConfig, findOnboardStepById, getOnboardFirstStep } from '../config/onboardConfig';
import Phase1LoadingPage from './Phase1LoadingPage';
import { verifyActivationToken, resendActivationEmail, checkAuthenticationStatus, storeAuthData, verifyJWT } from '../services/authService';
import { parseJWT, extractUserDataFromJWT, getJWTExpirationTime, extractEmailFromToken } from '../utils/tokenHelpers';

const ONBOARD_DATA_STORAGE_KEY = 'prevent-quiz-onboard-data';

const saveOnboardDataToStorage = (data: FormData) => {
  try {
    localStorage.setItem(ONBOARD_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save onboard data to localStorage:', error);
  }
};

const loadOnboardDataFromStorage = (): FormData => {
  try {
    const stored = localStorage.getItem(ONBOARD_DATA_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load onboard data from localStorage:', error);
    return {};
  }
};

export default function OnboardFunnel() {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<FormData>(loadOnboardDataFromStorage());
  const [currentStepId, setCurrentStepId] = useState<string>(getOnboardFirstStep().id);
  const [history, setHistory] = useState<string[]>([]);

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [activationEmail, setActivationEmail] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasJWT, setHasJWT] = useState(false);
  const [manualEmail, setManualEmail] = useState('');

  const [showDevNavigation, setShowDevNavigation] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      const jwt = searchParams.get('jwt');

      if (jwt) {
        console.log('[JWT Verification] Starting JWT verification...');

        const verifyResult = await verifyJWT(jwt);
        console.log('[JWT Verification] Result:', verifyResult);

        if (!verifyResult.success) {
          console.error('[JWT Verification] Failed:', verifyResult.error);
          setTokenError(verifyResult.message || 'Token JWT inválido ou expirado.');
          setIsValidatingToken(false);
          return;
        }

        const userData = extractUserDataFromJWT(jwt);
        console.log('[JWT Verification] User data extracted:', userData);

        if (!userData) {
          setTokenError('Não foi possível extrair dados do JWT.');
          setIsValidatingToken(false);
          return;
        }

        const expiresAt = getJWTExpirationTime(jwt);
        console.log('[JWT Verification] Expires at:', new Date(expiresAt).toISOString());

        storeAuthData(jwt, jwt, expiresAt, userData);

        setHasJWT(true);
        setIsAuthenticated(true);
        setFormData(prev => ({
          ...prev,
          email: userData.email,
          accountName: userData.name,
          skipPassword: true,
          jwtToken: jwt
        }));
        console.log('[JWT Verification] JWT validated and stored successfully');
        setIsValidatingToken(false);
        return;
      }

      const authStatus = checkAuthenticationStatus();
      if (authStatus.isAuthenticated) {
        setIsAuthenticated(true);
        setHasJWT(true);
        setFormData(prev => ({
          ...prev,
          email: authStatus.user?.email,
          accountName: authStatus.user?.name,
          skipPassword: true
        }));
        setIsValidatingToken(false);
        return;
      }

      if (!token) {
        setTokenError('Token de ativação não encontrado na URL.');
        setIsValidatingToken(false);
        return;
      }

      const result = await verifyActivationToken(token);

      if (!result.success) {
        if (result.code === 'ACTIVATION_TOKEN_EXPIRED' || result.code === 'INVALID_ACTIVATION_TOKEN') {
          setIsTokenExpired(true);

          let email = result.data?.email;
          if (!email) {
            email = extractEmailFromToken(token);
          }

          if (email) {
            setActivationEmail(email);
          }
        }
        setTokenError(result.message);
        setIsValidatingToken(false);
        return;
      }

      if (result.data?.email) {
        setActivationEmail(result.data.email);
        setFormData(prev => ({ ...prev, email: result.data.email, activationToken: token }));
      }

      setIsValidatingToken(false);
    };

    validateToken();
  }, [searchParams]);

  const handleResendEmail = async (emailToUse?: string) => {
    const email = emailToUse || activationEmail || manualEmail;
    if (!email) return;

    setIsResendingEmail(true);
    const result = await resendActivationEmail(email);

    if (result.success) {
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    }

    setIsResendingEmail(false);
  };

  const getCurrentStep = () => {
    return findOnboardStepById(currentStepId);
  };

  const handleContinue = (stepData: any) => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);
    saveOnboardDataToStorage(updatedFormData);

    setHistory(prev => [...prev, currentStepId]);

    const nextStepId = currentStep.nextStepLogic(updatedFormData);

    if (nextStepId === null) {
      console.log('Onboard funnel complete');
    } else {
      const nextStep = findOnboardStepById(nextStepId);
      if (nextStep) {
        setCurrentStepId(nextStepId);
      } else {
        console.error(`Next step with ID "${nextStepId}" not found in onboard configuration`);
      }
    }
  };

  const handlePhase1LoadingComplete = () => {
    window.location.href = 'https://socialsquaree.vercel.app/';
  };

  const handleBack = () => {
    if (history.length === 0) return;

    const newHistory = [...history];
    const previousStepId = newHistory.pop();

    if (previousStepId) {
      setHistory(newHistory);
      setCurrentStepId(previousStepId);
    }
  };

  const canGoBack = () => {
    return history.length > 0;
  };

  const jumpToStep = (stepId: string) => {
    setCurrentStepId(stepId);
    setHistory([]);
    saveOnboardDataToStorage(formData);
    setShowDevNavigation(false);
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-medium text-sm">Verificando token de ativação...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-dark mb-4">
            {isTokenExpired ? 'Token Expirado' : 'Token Inválido'}
          </h1>
          <p className="text-gray-medium text-sm mb-6">
            {tokenError}
          </p>
          {isTokenExpired && (
            <div className="space-y-4">
              {resendSuccess ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-success text-sm">Email de ativação reenviado com sucesso! Verifique sua caixa de entrada.</p>
                </div>
              ) : (
                <>
                  {activationEmail ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">Enviaremos um novo link de ativação para:</p>
                      <p className="text-sm font-medium text-gray-900 mb-4">{activationEmail}</p>
                      <button
                        onClick={() => handleResendEmail()}
                        disabled={isResendingEmail}
                        className="w-full py-3 px-4 bg-primary text-secondary rounded-xl hover:bg-[#5A54E3] transition-colors disabled:bg-gray-medium disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isResendingEmail ? 'Reenviando...' : 'Reenviar Email de Ativação'}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-2">Digite seu email para receber um novo link de ativação:</p>
                      <input
                        type="email"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-primary transition-colors mb-4 text-sm"
                      />
                      <button
                        onClick={() => handleResendEmail(manualEmail)}
                        disabled={isResendingEmail || !manualEmail.trim() || !manualEmail.includes('@')}
                        className="w-full py-3 px-4 bg-primary text-secondary rounded-xl hover:bg-[#5A54E3] transition-colors disabled:bg-gray-medium disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isResendingEmail ? 'Reenviando...' : 'Reenviar Email de Ativação'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    if (currentStepId === 'phase1_loading') {
      return (
        <Phase1LoadingPage
          formData={formData}
          onComplete={handlePhase1LoadingComplete}
        />
      );
    }

    const currentStep = getCurrentStep();
    if (!currentStep) {
      return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-danger mb-4">
              Error: Step Not Found
            </h1>
            <p className="text-gray-medium text-sm mb-6">
              Step "{currentStepId}" is not defined in the onboard configuration.
            </p>
            <button
              onClick={() => {
                setCurrentStepId(getOnboardFirstStep().id);
                setHistory([]);
                setFormData({});
                localStorage.removeItem(ONBOARD_DATA_STORAGE_KEY);
              }}
              className="py-2 px-4 bg-primary text-secondary rounded-xl hover:bg-[#5A54E3] text-sm font-medium"
            >
              Reset Onboard
            </button>
          </div>
        </div>
      );
    }

    const StepComponent = currentStep.component;
    return (
      <StepComponent
        onContinue={handleContinue}
        onBack={canGoBack() ? handleBack : undefined}
        formData={formData}
      />
    );
  };

  return (
    <div className="relative">
      {renderCurrentStep()}

      {/* {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-gray-dark/90 text-secondary p-3 rounded-xl text-xs font-mono z-20 max-w-xs shadow-lg">
          <div className="text-blue-light font-bold mb-1">ONBOARD FUNNEL</div>
          <div>Step: {currentStepId}</div>
          <div>History: {history.length}</div>

          <div className="mt-3 border-t border-gray-medium pt-2">
            <button
              onClick={() => setShowDevNavigation(!showDevNavigation)}
              className="text-blue-light hover:text-blue-400 underline text-xs"
            >
              {showDevNavigation ? 'Hide' : 'Jump to Step'}
            </button>

            {showDevNavigation && (
              <div className="mt-2 max-h-48 overflow-y-auto bg-gray-800 rounded-xl p-2">
                <div className="mb-2 text-gray-light font-bold">Onboard Steps:</div>
                {onboardConfig.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(step.id)}
                    className={`block w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded-lg mb-1 ${
                      currentStepId === step.id ? 'bg-blue-light' : ''
                    }`}
                  >
                    {step.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}