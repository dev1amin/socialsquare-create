import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function InstagramConfirmationForm({ onContinue, onBack, formData }: FormStepProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Get the profile data from the previous step
  const profileData = formData?.userProfileMetrics;

  console.log(profileData.verified)

  const handleChange = () => {
    // Signal to go back to Instagram handle selection
    if (onContinue) {
      onContinue({ goBackToInstagramHandle: true });
    }
  };
  
  // If no profile data or success is not true, show error state
  if (!profileData || profileData.success !== true) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <div className="pt-12 pb-16 px-6">
          <Logo />
        </div>
        
        <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full justify-center items-center">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-medium text-gray-dark">
              Perfil não encontrado
            </h1>
            <p className="text-gray-medium">
              Não conseguimos encontrar este perfil do Instagram. Verifique o nome de usuário e tente novamente.
            </p>
            <button
              onClick={handleChange}
              className="w-full py-4 px-6 rounded-xl font-medium text-white bg-primary hover:bg-[#5A54E3] transition-all duration-200"
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
          goBackToInstagramHandle: false // Clear any back navigation flag
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
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-12 pb-16 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <div className="flex flex-col h-full">
          {/* Question */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-dark text-left">
              Este é o seu perfil?
            </h1>
          </div>

          {/* Profile Card */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border-2 border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={profileData.profilePicture}
                alt="Profile"
                className="w-16 h-16 rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=?';
                }}
              />
              <div className="flex-1">
                <div className="flex gap-2 items-center font-semibold text-sm text-gray-dark">
                  {profileData.name}                     {profileData.verified === "true" && (
                      <svg aria-label="Verificado" class="x1lliihq x1n2onr6" fill="rgb(0, 149, 246)" height="18" role="img" viewBox="0 0 40 40" width="18"><title>Verificado</title><path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fill-rule="evenodd"></path></svg>
                    )}
                </div>
                <div className="text-primary font-medium">
                  <div className="flex items-center space-x-1">
                    <span>@{profileData.username}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="font-bold text-sm text-gray-dark">
                  {formatNumber(profileData.media)}
                </div>
                <div className="text-sm text-gray-medium">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-gray-dark">
                  {formatNumber(profileData.followers)}
                </div>
                <div className="text-sm text-gray-medium">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-gray-dark">
                  {formatNumber(profileData.following)}
                </div>
                <div className="text-sm text-gray-medium">Seguindo</div>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-dark leading-relaxed">
                  {profileData.bio.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3 pb-20">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`w-full py-4 px-6 text-sm rounded-xl font-medium transition-all duration-200  ${
                isConfirming
                  ? 'bg-accent/70 text-white cursor-not-allowed'
                  : 'bg-primary text-secondary hover:bg-accent/90 active:scale-95'
              }`}
            >
              {isConfirming ? 'Confirmando...' : 'Sim, esse é meu perfil'}
            </button>
            
            <button
              type="button"
              onClick={handleChange}
              disabled={isConfirming}
              className={`w-full py-4 px-6 text-sm rounded-xl border-2 font-medium transition-all duration-200  ${
                isConfirming
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-dark hover:border-primary hover:text-primary'
              }`}
            >
              Não, quero alterar
            </button>

            {/* Back Button */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 px-4 rounded-xl font-medium text-gray-dark bg-gray-light hover:bg-gray-200 text-sm transition-all duration-200"
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