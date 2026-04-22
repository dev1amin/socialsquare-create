import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { FormData } from '../types/form';
import { createBusiness, transformFormDataToBusinessPayload } from '../services/businessService';
import { getStoredAuthTokens } from '../services/authService';

interface Phase1LoadingPageProps {
  formData: FormData;
  onComplete: () => void;
}

export default function Phase1LoadingPage({ formData, onComplete }: Phase1LoadingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);

  const steps = [
    "Salvando informações...",
    "Criando seu business...",
    "Inicializando Feed...",
    "Personalizando..."
  ];

  useEffect(() => {
    const runBusinessCreation = async () => {
      const stepDuration = 1000;
      const intervals: NodeJS.Timeout[] = [];

      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, stepDuration));

      setCurrentStep(1);
      setIsCreatingBusiness(true);

      try {
        console.log('[Phase1Loading] Starting business creation process');
        console.log('[Phase1Loading] Form data:', formData);

        const { accessToken } = getStoredAuthTokens();
        console.log('[Phase1Loading] Access token retrieved:', !!accessToken);

        if (!accessToken) {
          console.error('[Phase1Loading] No access token found');
          throw new Error('Nenhum token de autenticação encontrado');
        }

        console.log('[Phase1Loading] Transforming form data to payload...');
        let payload;
        try {
          payload = transformFormDataToBusinessPayload(formData);
        } catch (err) {
          const m = err instanceof Error ? err.message : 'Dados insuficientes';
          throw new Error(m);
        }

        if (!payload) {
          console.error('[Phase1Loading] Payload is null - insufficient data');
          throw new Error('Dados insuficientes para criar o business');
        }

        console.log('[Phase1Loading] Payload created successfully, calling API...');
        const result = await createBusiness(accessToken, payload);

        if (!result.success) {
          if (result.details && result.details.length > 0) {
            const errorMessages = result.details.map(d => d.message).join(', ');
            throw new Error(errorMessages);
          }
          throw new Error(result.message || 'Falha ao criar business');
        }

        setIsCreatingBusiness(false);

        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, stepDuration));

        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, stepDuration));

        try {
          localStorage.removeItem('prevent-quiz-onboard-data');
        } catch (err) {
          console.warn('Failed to clear onboard data from localStorage:', err);
        }

        onComplete();

      } catch (err) {
        setIsCreatingBusiness(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Business creation failed:', err);
      }

      return () => {
        intervals.forEach(clearTimeout);
      };
    };

    runBusinessCreation();
  }, [formData, onComplete]);

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-16 pb-20 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full justify-center">
        {error ? (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-danger mb-2">
                Erro ao criar business
              </h1>
              <p className="text-gray-medium text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-secondary rounded-xl hover:bg-[#5A54E3] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="space-y-10 text-center">

            {/* Progress Indicator */}
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
              </div>

              {/* Current Step Text */}
              <div className="space-y-4">
                <h1 className="text-xl font-semibold text-gray-dark">
                  {steps[currentStep]}
                </h1>

                {/* Step Progress Dots */}
                <div className="flex justify-center space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-primary'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Phase Transition Message */}
            {currentStep >= 2 && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h2 className="text-lg font-medium text-gray-dark mb-2">
                  Fase 1 Completa!
                </h2>
                <p className="text-gray-medium text-sm">
                  Preparando para a próxima etapa: definir o tom de voz da sua marca
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}