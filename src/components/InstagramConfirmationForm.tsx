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
          goBackToInstagramHandle: false,
        });
      }
    }, 300);
  };

  const formatNumber = (num: string) => {
    const number = parseInt(num);
    if (Number.isNaN(number)) return '0';
    if (number >= 1_000_000) return (number / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (number >= 1_000) return (number / 1_000).toFixed(1).replace('.0', '') + 'K';
    return number.toString();
  };

  const placeholderAvatar = `https://ui-avatars.com/api/?background=eef2ff&color=4f46e5&name=${encodeURIComponent(profileData.name || profileData.username || '?')}`;

  return (
    <div className="onboard-container">
      <div className="onboard-header">
        <Logo />
      </div>

      <div className="onboard-content">
        <div className="onboard-form">
          <div className="onboard-question">
            <h1 className="onboard-title">Este é o seu perfil?</h1>
            <p className="onboard-subtitle">Confira se reconhece os dados antes de continuar.</p>
          </div>

          <div className="onboard-input-section">
            <div className="relative w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-14 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100" />

              <div className="px-5 pb-5">
                <div className="-mt-10 mb-3 flex items-end gap-3">
                  <div className="relative">
                    <img
                      src={profileData.profilePicture || placeholderAvatar}
                      alt={profileData.username || 'Perfil'}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = placeholderAvatar;
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h2 className="font-semibold text-gray-900 truncate text-base leading-tight">
                        {profileData.name || profileData.username}
                      </h2>
                      {String(profileData.verified) === 'true' && (
                        <svg
                          aria-label="Verificado"
                          className="flex-shrink-0"
                          fill="rgb(0, 149, 246)"
                          height="14"
                          role="img"
                          viewBox="0 0 40 40"
                          width="14"
                        >
                          <title>Verificado</title>
                          <path
                            d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
                            fillRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <a
                      href={`https://www.instagram.com/${profileData.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary font-medium hover:underline truncate block"
                    >
                      @{profileData.username}
                    </a>
                  </div>
                </div>

                {profileData.bio && (
                  <p className="text-sm text-gray-700 leading-snug whitespace-pre-line line-clamp-3 mb-4">
                    {profileData.bio}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-center">
                    <div className="text-base font-semibold text-gray-900 leading-tight">
                      {formatNumber(profileData.media || '0')}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Posts</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-center">
                    <div className="text-base font-semibold text-gray-900 leading-tight">
                      {formatNumber(profileData.followers || '0')}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Seguidores</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-center">
                    <div className="text-base font-semibold text-gray-900 leading-tight">
                      {formatNumber(profileData.following || '0')}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Seguindo</div>
                  </div>
                </div>
              </div>
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
