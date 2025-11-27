import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function InstagramConfirmationForm({ onContinue, onBack, formData }: FormStepProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  const profileData = formData?.userProfileMetrics;

  const handleChange = () => {
    if (onContinue) {
      onContinue({ goBackToInstagramHandle: true });
    }
  };
  
  if (!profileData || profileData.success !== true) {
    return (
      <div className="onboard-container">
        <div className="onboard-header">
          <Logo />
        </div>
        
        <div className="onboard-content justify-center items-center">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-xl font-medium text-gray-dark">
              Perfil não encontrado
            </h1>
            <p className="text-gray-medium text-sm">
              Não conseguimos encontrar este perfil do Instagram. Verifique o nome de usuário e tente novamente.
            </p>
            <button
              onClick={handleChange}
              className="onboard-btn-primary"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      if (onContinue) {
        onContinue({ 
          profileConfirmed: true,
          goBackToInstagramHandle: false
        });
      }
    }, 300);
  };

  const formatNumber = (num: string) => {
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  return (
    <div className="onboard-container">
      <div className="onboard-header">
        <Logo />
      </div>

      <div className="onboard-content">
        <div className="onboard-form">
          <div className="onboard-question">
            <h1 className="onboard-title">Este é o seu perfil?</h1>
          </div>

          <div className="onboard-input-section">
            {/* Profile Card */}
            <div className="bg-gray-50 rounded-xl p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=?';
                  }}
                />
                <div className="flex-1">
                  <div className="flex gap-2 items-center font-semibold text-sm text-gray-dark">
                    {profileData.name}
                    {profileData.verified === "true" && (
                      <svg aria-label="Verificado" className="flex-shrink-0" fill="rgb(0, 149, 246)" height="16" role="img" viewBox="0 0 40 40" width="16"><title>Verificado</title><path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path></svg>
                    )}
                  </div>
                  <div className="text-primary font-medium text-sm">
                    @{profileData.username}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-dark">
                    {formatNumber(profileData.media)}
                  </div>
                  <div className="text-xs text-gray-medium">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-dark">
                    {formatNumber(profileData.followers)}
                  </div>
                  <div className="text-xs text-gray-medium">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm text-gray-dark">
                    {formatNumber(profileData.following)}
                  </div>
                  <div className="text-xs text-gray-medium">Seguindo</div>
                </div>
              </div>

              {/* Bio */}
              {profileData.bio && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs text-gray-dark leading-relaxed line-clamp-3">
                    {profileData.bio.split('\n').map((line: string, index: number) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="onboard-buttons">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="onboard-btn-primary"
            >
              {isConfirming ? 'Confirmando...' : 'Sim, esse é meu perfil'}
            </button>
            
            <button
              type="button"
              onClick={handleChange}
              disabled={isConfirming}
              className="onboard-btn-outline"
            >
              Não, quero alterar
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="onboard-btn-secondary"
              >
                Voltar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
