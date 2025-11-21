import React, { useState } from 'react';
import Logo from './Logo';
import { FormStepProps } from '../types/form';

export default function CoreValuesForm({ onContinue, onBack, formData }: FormStepProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(formData?.coreValues || []);

  const values = [
    "Ética e Integridade",
    "Respeito às Pessoas", 
    "Excelência e Qualidade",
    "Inovação e Curiosidade",
    "Foco no Cliente",
    "Colaboração e Trabalho em Equipe",
    "Sustentabilidade e Responsabilidade Social",
    "Liberdade e Autonomia",
    "Coragem e Resiliência",
    "Humanidade e Empatia",
    "Disciplina",
    "Transparência Radical",
    "Velocidade/Agilidade",
    "Meritocracia e Reconhecimento",
    "Accountability (Responsabilização)",
    "Aprendizado Contínuo",
    "Pragmatismo e Simplicidade",
    "Generosidade e Compartilhamento",
    "Coragem Criativa",
    "Confiança",
    "Justiça",
    "Humildade",
    "Autenticidade",
    "Gratidão",
    "Espírito de Serviço",
    "Paciência",
    "Alegria",
    "Honra",
    "Determinação",
    "Visão de Futuro"
  ];

  const handleValueToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      // Remove if already selected
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else {
      // Add if not selected and under limit
      if (selectedValues.length < 3) {
        setSelectedValues([...selectedValues, value]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedValues.length > 0 && onContinue) {
      onContinue({ coreValues: selectedValues });
    }
  };

  const isValidToSubmit = selectedValues.length > 0;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header with Logo */}
      <div className="pt-12 pb-8 px-6">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Question */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-dark text-left leading-tight">
              Quais valores não são negociáveis da marca?
            </h1>
            <p className="text-sm text-gray-medium mt-2">
              Selecione de 1 a 3 valores centrais ({selectedValues.length}/3)
            </p>
          </div>

          {/* Values Options */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 max-h-80 overflow-y-auto pr-2">
              {values.map((value) => {
                const isSelected = selectedValues.includes(value);
                const isDisabled = !isSelected && selectedValues.length >= 3;
                
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleValueToggle(value)}
                    disabled={isDisabled}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-secondary'
                        : isDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-dark hover:bg-accent hover:text-white'
                    }`}
                  >
                    {value}
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