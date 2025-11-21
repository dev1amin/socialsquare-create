import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';
import FormButtons from './FormButtons';

export default function InstagramHandleForm({ onContinue, onBack, formData }: FormStepProps) {
  const [instagramHandle, setInstagramHandle] = useState(formData?.instagramHandle || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidInstagramHandle = () => {
    const trimmed = instagramHandle.trim();
    return trimmed.length >= 1 && trimmed.length <= 30 && /^[a-zA-Z0-9._]+$/.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidInstagramHandle()) {
      setErrorMessage('Digite um @ de Instagram válido.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://webhook.workez.online/webhook/trends/lander/getUserProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          instagramHandle: instagramHandle.trim(),
        }),
      });

      if (!response.ok) {
        console.error('User profile request failed:', response.status, response.statusText);
        setErrorMessage('Não conseguimos puxar esse @. Confira se digitou certo e tente de novo. :)');
        return; // NÃO chama onContinue
      }

      const responseData = await response.json();
      console.log('User profile metrics:', responseData);

      if (responseData && responseData.success === true) {
        // Sucesso → pode continuar
        onContinue?.({
          instagramHandle: instagramHandle.trim(),
          userProfileMetrics: {
            ...responseData,
          },
        });
      } else {
        console.error('Invalid profile data or profile not found:', responseData);
        // Perfil não encontrado / inválido → mantém na tela e mostra erro
        setErrorMessage('Não encontramos esse perfil. Provavelmente o @ está errado. Tenta novamente.');
        // se você QUISER continuar mesmo assim, aí sim chamaria onContinue aqui.
      }
    } catch (error) {
      console.error('User profile request error:', error);
      setErrorMessage('Erro ao buscar o perfil. Confere o @ e tenta novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/^@/, '');
    if (/^[a-zA-Z0-9._]*$/.test(cleanValue) && cleanValue.length <= 30) {
      setInstagramHandle(cleanValue);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-12 pb-16 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Question */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-dark text-left">
              Qual o @ do seu perfil no instagram?
              <span className="text-danger text-sm ml-2">*</span>
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              (Obrigatório)
            </p>
          </div>

          {/* Input Field */}
          <div className="flex-1">
            {isLoading ? (
              <div className="w-full py-8 text-center">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-xl h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-medium">
                    Buscando dados do perfil...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <img
                      src="https://cdn.iconscout.com/icon/free/png-256/free-instagram-logo-icon-svg-download-png-1646407.png"
                      alt="Instagram"
                      className="w-5 h-5 mr-2"
                    />
                    <span className="text-sm text-gray-medium">@</span>
                  </div>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={handleInstagramChange}
                    className="w-full pl-16 pr-4 py-4 text-sm text-gray-dark bg-secondary border border-[#E5E5E5] rounded-xl transition-all duration-200 focus:outline-none focus:border-primary hover:border-primary placeholder-gray-medium"
                    maxLength={30}
                    autoFocus
                    placeholder="seu_usuario_instagram"
                  />
                </div>

                {errorMessage && (
                  <p className="mt-2 text-sm text-danger">
                    {errorMessage}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Bottom Section with Button */}
          {!isLoading && (
            <FormButtons
              onBack={onBack}
              continueDisabled={!isValidInstagramHandle()}
              continueText="Continuar"
              showBack={!!onBack}
            />
          )}
        </form>
      </div>
    </div>
  );
}