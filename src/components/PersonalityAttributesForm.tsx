import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function PersonalityAttributesForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(formData?.personalityAttributes || []);

  const attributes = [
    'Amigável / Conversacional',
    'Formal / Polido',
    'Descontraído / Divertido',
    'Sério / Sóbrio',
    'Inspirador / Emocional',
    'Informativo / Direto',
    'Inovador / Vanguardista',
    'Tradicional / Conservador',
    'Autoritativo / Especialista',
    'Humilde / Colaborativo',
    'Enérgico / Entusiasmado',
    'Calmo / Paciente',
    'Exclusivo / Sofisticado',
    'Acessível / Simples',
    'Empático / Acolhedor',
    'Objetivo / Frio'
  ];

  const handleAttributeToggle = (attribute: string) => {
    if (selectedAttributes.includes(attribute)) {
      // Remove if already selected
      setSelectedAttributes(selectedAttributes.filter(attr => attr !== attribute));
    } else {
      // Add if not selected and under limit
      if (selectedAttributes.length < 5) {
        setSelectedAttributes([...selectedAttributes, attribute]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAttributes.length >= 3 && onContinue) {
      onContinue({ personalityAttributes: selectedAttributes });
    }
  };

  const isValidToSubmit = selectedAttributes.length >= 3;

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
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-dark text-left leading-tight">
              Quais atributos de personalidade definem o tom de voz da marca?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Selecione de 3 a 5 atributos que melhor descrevem o estilo de comunicação desejado ({selectedAttributes.length}/5)
            </p>
          </div>

          {/* Attributes Bubbles */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 max-h-80 overflow-y-auto pr-2">
              {attributes.map((attribute) => {
                const isSelected = selectedAttributes.includes(attribute);
                const isDisabled = !isSelected && selectedAttributes.length >= 5;
                
                return (
                  <button
                    key={attribute}
                    type="button"
                    onClick={() => handleAttributeToggle(attribute)}
                    disabled={isDisabled}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-secondary shadow-md'
                        : isDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-dark hover:bg-accent hover:text-white'
                    }`}
                  >
                    {attribute}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Section with Continue Button */}
          <div className="pt-6 pb-8">
            <button
              type="submit"
              disabled={!isValidToSubmit}
              className={`w-full py-4 px-6 rounded-xl font-medium text-white text-sm transition-all duration-200  ${
                isValidToSubmit
                  ? 'bg-primary hover:bg-[#5A54E3] active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
            {selectedAttributes.length < 3 && (
              <p className="text-xs text-gray-medium text-center mt-2">
                Selecione pelo menos 3 atributos para continuar
              </p>
            )}
            {selectedAttributes.length >= 3 && (
              <p className="text-xs text-green-600 text-center mt-2">
                ✓ {selectedAttributes.length} atributos selecionados
              </p>
            )}
          </div>
        </form>
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