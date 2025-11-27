import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function SocialNetworkTypeForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedType, setSelectedType] = useState(formData?.socialNetworkType || '');

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
    setTimeout(() => {
      if (onContinue) {
        onContinue({ socialNetworkType: type });
      }
    }, 300);
  };

  return (
    <div className="onboard-container">
      <div className="onboard-header">
        <Logo />
      </div>

      <div className="onboard-content">
        <div className="onboard-form">
          <div className="onboard-question">
            <h1 className="onboard-title">A sua rede social é:</h1>
          </div>

          <div className="onboard-input-section">
            <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleTypeSelection('Marca Pessoal')}
              className={`w-full py-3 lg:py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200 text-left ${
                selectedType === 'Marca Pessoal'
                  ? 'border-primary bg-accent/5 text-primary'
                  : 'border-[#CFCFCF] text-gray-dark hover:border-primary'
              }`}
            >
              Marca Pessoal
            </button>
            
            <button
              type="button"
              onClick={() => handleTypeSelection('Empresa')}
              className={`w-full py-3 lg:py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200 text-left ${
                selectedType === 'Empresa'
                  ? 'border-primary bg-accent/5 text-primary'
                  : 'border-[#CFCFCF] text-gray-dark hover:border-primary'
              }`}
            >
              Empresa
            </button>
            </div>
          </div>

          {onBack && (
            <div className="onboard-buttons">
              <button
                type="button"
                onClick={onBack}
                className="onboard-btn-secondary"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
