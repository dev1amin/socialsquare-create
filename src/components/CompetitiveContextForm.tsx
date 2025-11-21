import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function CompetitiveContextForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedContext, setSelectedContext] = useState(formData?.competitiveContext || '');

  const contexts = [
    'Pioneira',
    'Desafiante',
    'Disruptiva',
    'Líder estabelecida',
    'Especialista de Nicho',
    'Concorrência Fragmentada'
  ];

  const handleContextSelection = (context: string) => {
    setSelectedContext(context);
    // Auto-forward after a brief delay for visual feedback
    setTimeout(() => {
      if (onContinue) {
        onContinue({ competitiveContext: context });
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
              Qual afirmação melhor descreve o contexto competitivo da marca?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Selecione aquela que mais se aproxima da situação atual
            </p>
          </div>

          {/* Context Options */}
          <div className="flex-1 space-y-3 pb-20">
            {contexts.map((context) => (
              <button
                key={context}
                type="button"
                onClick={() => handleContextSelection(context)}
                className={`w-full py-4 px-6 text-sm rounded-xl border-2 transition-all duration-200  text-left ${
                  selectedContext === context
                    ? 'border-primary bg-accent/5 text-primary'
                    : 'border-gray-200 bg-white text-gray-dark hover:border-primary hover:bg-gray-50'
                }`}
              >
                {context}
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