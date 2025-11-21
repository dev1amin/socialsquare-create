import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function SocialNetworkTypeForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedType, setSelectedType] = useState(formData?.socialNetworkType || '');

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
    // Auto-forward after a brief delay for visual feedback
    setTimeout(() => {
      if (onContinue) {
        onContinue({ socialNetworkType: type });
      }
    }, 300);
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
              A sua rede social é:
            </h1>
          </div>

          {/* Options */}
          <div className="flex-1 space-y-4 pb-20">
            <button
              type="button"
              onClick={() => handleTypeSelection('Marca Pessoal')}
              className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200  text-left ${
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
              className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200  text-left ${
                selectedType === 'Empresa'
                  ? 'border-primary bg-accent/5 text-primary'
                  : 'border-[#CFCFCF] text-gray-dark hover:border-primary'
              }`}
            >
              Empresa
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <div className="fixed bottom-[50px] left-0 right-0 px-6 max-w-sm mx-auto w-full">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 px-4 rounded-xl font-medium text-gray-dark bg-gray-light hover:bg-gray-200 text-sm transition-all duration-200"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}