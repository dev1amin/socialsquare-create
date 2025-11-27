import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function MainObjectiveForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedObjective, setSelectedObjective] = useState(formData?.mainObjective || '');

  const objectives = [
    { emoji: '🌍', text: 'Aumentar audiência' },
    { emoji: '👶', text: 'Crescer perfil do zero' },
    { emoji: '💰', text: 'Monetizar audiência' },
    { emoji: '❤️', text: 'Aumentar engajamento' }
  ];

  const handleObjectiveSelection = (objective: string) => {
    setSelectedObjective(objective);
    setTimeout(() => {
      if (onContinue) {
        onContinue({ mainObjective: objective });
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
            <h1 className="onboard-title">Qual seu objetivo principal?</h1>
          </div>

          <div className="onboard-input-section">
            <div className="space-y-3">
            {objectives.map((objective) => (
              <button
                key={objective.text}
                type="button"
                onClick={() => handleObjectiveSelection(objective.text)}
                className={`w-full py-3 lg:py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedObjective === objective.text
                    ? 'border-primary bg-accent/5 text-primary'
                    : 'border-[#CFCFCF] text-gray-dark hover:border-primary'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-xl" role="img" aria-label="objective emoji">
                    {objective.emoji}
                  </span>
                  <span>{objective.text}</span>
                </div>
              </button>
            ))}
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
