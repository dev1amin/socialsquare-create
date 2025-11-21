import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function MainObjectiveForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedObjective, setSelectedObjective] = useState(formData?.mainObjective || '');

  const objectives = [
    {
      emoji: '🌍',
      text: 'Aumentar audiência'
    },
    {
      emoji: '👶',
      text: 'Crescer perfil do zero'
    },
    {
      emoji: '💰',
      text: 'Monetizar audiência'
    },
    {
      emoji: '❤️',
      text: 'Aumentar engajamento'
    }
  ];

  const handleObjectiveSelection = (objective: string) => {
    setSelectedObjective(objective);
    // Auto-forward after a brief delay for visual feedback
    setTimeout(() => {
      if (onContinue) {
        onContinue({ mainObjective: objective });
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
            <h1 className="text-2xl font-semibold text-gray-dark text-left leading-tight">
              Qual seu objetivo principal?
            </h1>
          </div>

          {/* Options */}
          <div className="flex-1 space-y-4 pb-20">
            {objectives.map((objective) => (
              <button
                key={objective.text}
                type="button"
                onClick={() => handleObjectiveSelection(objective.text)}
                className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200  text-left ${
                  selectedObjective === objective.text
                    ? 'border-primary bg-accent/5 text-primary'
                    : 'border-[#CFCFCF] text-gray-dark hover:border-primary'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl" role="img" aria-label="objective emoji">
                    {objective.emoji}
                  </span>
                  <span>
                    {objective.text}
                  </span>
                </div>
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