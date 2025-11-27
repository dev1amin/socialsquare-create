import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function WeightChangeForm({ onContinue, onBack, formData }: FormStepProps) {
  const [hasWebsite, setHasWebsite] = useState(formData?.hasWebsite || '');

  const options = ['Sim', 'Não'];

  const handleWebsiteSelection = (answer: string) => {
    setHasWebsite(answer);
    setTimeout(() => {
      if (onContinue) {
        onContinue({ hasWebsite: answer });
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
            <h1 className="onboard-title">Você tem um site?</h1>
          </div>

          <div className="onboard-input-section space-y-3">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleWebsiteSelection(option)}
                className={`w-full py-3 lg:py-4 px-6 text-sm rounded-xl border-2 transition-all duration-300 text-left ${
                  hasWebsite === option
                    ? 'border-primary bg-accent/5 text-primary'
                    : 'border-gray-200 bg-white text-gray-dark hover:border-primary hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
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
