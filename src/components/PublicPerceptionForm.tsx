import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function PublicPerceptionForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedPerception, setSelectedPerception] = useState(formData?.publicPerception || '');

  const perceptions = [
    'Desconhecimento',
    'Ceticismo',
    'Insatisfação Latente',
    'Satisfeito com Concorrente',
    'Sensível a Preço',
    'Consciente e Exigente',
    'Entusiastas da Marca (caso já tenha clientes)'
  ];

  const handlePerceptionSelection = (perception: string) => {
    setSelectedPerception(perception);
    // Auto-forward after a brief delay for visual feedback
    setTimeout(() => {
      if (onContinue) {
        onContinue({ publicPerception: perception });
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
            <h1 className="text-xl font-semibold text-gray-dark text-left leading-tight">
              Como o público percebe atualmente as soluções existentes (ou a própria marca, se já tiver presença)?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Selecione a opção que mais reflete a situação atual
            </p>
          </div>

          {/* Perception Options */}
          <div className="flex-1 space-y-3 pb-20">
            {perceptions.map((perception) => (
              <button
                key={perception}
                type="button"
                onClick={() => handlePerceptionSelection(perception)}
                className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200  text-left ${
                  selectedPerception === perception
                    ? 'border-primary bg-accent/5 text-primary'
                    : 'border-gray-200 bg-white text-gray-dark hover:border-primary hover:bg-gray-50'
                }`}
              >
                {perception}
              </button>
            ))}
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