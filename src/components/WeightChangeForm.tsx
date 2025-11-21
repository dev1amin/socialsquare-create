import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function WeightChangeForm({ onContinue, onBack, formData }: FormStepProps) {
  const [hasWebsite, setHasWebsite] = useState(formData?.hasWebsite || '');

  const options = [
    'Sim',
    'Não'
  ];

  const handleWebsiteSelection = (answer: string) => {
    setHasWebsite(answer);
    // Auto-forward after a brief delay for visual feedback
    setTimeout(() => {
      if (onContinue) {
        onContinue({ hasWebsite: answer });
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
          <div className="mb-12">
            <h1 className="text-2xl font-semibold text-gray-dark text-left leading-tight">
              Você tem um site?
            </h1>
          </div>

          {/* Options */}
          <div className="flex-1 space-y-4 pb-20">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleWebsiteSelection(option)}
                className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-300  text-left shadow-sm hover:shadow-md ${
                  hasWebsite === option
                    ? 'border-primary bg-accent/5 text-primary shadow-accent/10'
                    : 'border-gray-200 bg-white text-gray-dark hover:border-primary hover:bg-gray-50'
                }`}
              >
                {option}
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